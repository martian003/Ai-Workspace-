import io, os, zipfile
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Project, SourceFile
from .services import answer_question

def archive(entries):
    data=io.BytesIO()
    with zipfile.ZipFile(data,'w',zipfile.ZIP_DEFLATED) as z:
        for path, content in entries.items(): z.writestr(path,content)
    return SimpleUploadedFile('repo.zip',data.getvalue(),content_type='application/zip')

class WorkspaceTests(TestCase):
    def setUp(self):
        self.owner=get_user_model().objects.create_user(username='owner',password='test-password-938!')
        self.other=get_user_model().objects.create_user(username='other',password='test-password-938!')
        self.client=APIClient();self.client.force_authenticate(self.owner)
        self.project=Project.objects.create(owner=self.owner,name='Sample')
        self.base=f'/api/projects/{self.project.id}/'

    def test_authentication_required(self):
        c=APIClient();self.assertEqual(c.get('/api/projects/').status_code,401)

    def test_registration_login_and_logout(self):
        c=APIClient()
        r=c.post('/api/auth/register/',{'username':'rohit','password':'Strong-unique-9274!'});self.assertEqual(r.status_code,201)
        c.credentials(HTTP_AUTHORIZATION='Token '+r.data['token'])
        self.assertEqual(c.get('/api/projects/').status_code,200)
        self.assertEqual(c.post('/api/auth/logout/').status_code,204)
        self.assertEqual(c.get('/api/projects/').status_code,401)
        self.assertEqual(c.post('/api/auth/login/',{'username':'rohit','password':'Strong-unique-9274!'}).status_code,200)

    def test_cross_user_access(self):
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get('/api/projects/').data,[])
        for endpoint in ['files/','questions/']:
            self.assertEqual(self.client.get(self.base+endpoint).status_code,404)
        self.assertEqual(self.client.post(self.base+'upload/',{'file':archive({'a.py':'x=1'})}).status_code,404)
        self.assertEqual(self.client.delete(self.base).status_code,404)

    def test_upload_search_history_and_file(self):
        r=self.client.post(self.base+'upload/',{'file':archive({'src/auth.py':'def authenticate_user(token):\n    return token is not None\n','.env':'SECRET=hidden','node_modules/a.js':'ignored'})})
        self.assertEqual(r.status_code,200);self.assertEqual(r.data['indexed'],1)
        files=self.client.get(self.base+'files/').data;self.assertEqual(len(files),1)
        self.assertIn('authenticate_user',self.client.get(self.base+f"files/{files[0]['id']}/").data['content'])
        with patch.dict(os.environ,{'OPENAI_API_KEY':''}):
            r=self.client.post(self.base+'questions/',{'question':'Where is authenticate_user defined?'})
        self.assertEqual(r.status_code,201);self.assertEqual(r.data['mode'],'search')
        self.assertEqual(r.data['sources'][0]['path'],'src/auth.py')
        self.assertEqual(len(self.client.get(self.base+'questions/').data),1)
        self.assertEqual(self.client.post(self.base+'upload/',{'file':archive({'new.py':'replacement=1'})}).status_code,200)
        self.assertEqual(self.client.get(self.base+'questions/').data,[])

    def test_reject_traversal_preserves_existing_files(self):
        SourceFile.objects.create(project=self.project,path='safe.py',content='safe=1')
        for name in ['../bad.py','/bad.py','C:/bad.py','dir\\bad.py']:
            self.assertEqual(self.client.post(self.base+'upload/',{'file':archive({name:'bad'})}).status_code,400)
        self.assertEqual(self.project.files.count(),1)

    def test_reject_symlink(self):
        data=io.BytesIO()
        with zipfile.ZipFile(data,'w') as z:
            info=zipfile.ZipInfo('link.py');info.external_attr=0o120777 << 16;z.writestr(info,'/etc/passwd')
        self.assertEqual(self.client.post(self.base+'upload/',{'file':SimpleUploadedFile('a.zip',data.getvalue())}).status_code,400)

    def test_invalid_zip_and_validation(self):
        self.assertEqual(self.client.post(self.base+'upload/',{'file':SimpleUploadedFile('bad.zip',b'broken')}).status_code,400)
        self.assertEqual(self.client.post('/api/projects/',{'name':''}).status_code,400)
        self.assertEqual(self.client.post(self.base+'questions/',{'question':'hello'}).status_code,400)

    def test_mocked_ai_uses_retrieved_context(self):
        from types import SimpleNamespace
        SourceFile.objects.create(project=self.project,path='auth.py',content='def authenticate_user(): pass')
        with patch.dict(os.environ,{'OPENAI_API_KEY':'test'}),patch('openai.OpenAI') as client:
            client.return_value.chat.completions.create.return_value=SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content='See auth.py:1.'))])
            answer,sources,mode=answer_question(self.project,'authenticate_user')
            self.assertEqual(mode,'ai');self.assertEqual(sources[0]['start_line'],1)
            call=client.return_value.chat.completions.create.call_args.kwargs
            self.assertIn('auth.py:1',call['messages'][1]['content'])

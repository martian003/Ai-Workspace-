from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction, IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, throttle_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.models import Token
from rest_framework.throttling import UserRateThrottle
from .models import Project, SourceFile, Exchange
from .services import read_repository, answer_question

class QuestionThrottle(UserRateThrottle):
    scope = 'questions'

def owned(request, pk):
    return get_object_or_404(Project,pk=pk,owner=request.user)

def project_data(p):
    return {'id':p.id,'name':p.name,'file_count':p.files.count(),'created_at':p.created_at}

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def health(request): return Response({'status':'ok'})

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register(request):
    username = request.data.get('username','')
    password = request.data.get('password','')
    if not isinstance(username,str) or not isinstance(password,str) or not username.strip() or len(username)>150:
        raise ValidationError('Provide a username (up to 150 characters) and password.')
    user = get_user_model()(username=username.strip())
    try: validate_password(password,user)
    except DjangoValidationError as exc: raise ValidationError({'password':exc.messages})
    try:
        with transaction.atomic():
            user.set_password(password); user.full_clean(exclude=['password']); user.save()
    except (IntegrityError,DjangoValidationError): raise ValidationError('Username unavailable or invalid.')
    return Response({'token':Token.objects.create(user=user).key,'username':user.username},status=201)

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login(request):
    username=request.data.get('username'); password=request.data.get('password')
    if not isinstance(username,str) or not isinstance(password,str): raise ValidationError('Username and password required.')
    user=authenticate(username=username,password=password)
    if user is None: return Response({'detail':'Invalid credentials.'},status=400)
    return Response({'token':Token.objects.get_or_create(user=user)[0].key,'username':user.username})

@api_view(['POST'])
def logout(request):
    request.auth.delete()
    return Response(status=204)

@api_view(['GET','POST'])
def projects(request):
    if request.method=='GET': return Response([project_data(p) for p in Project.objects.filter(owner=request.user).order_by('-id')])
    name=request.data.get('name','')
    if not isinstance(name,str) or not 1<=len(name.strip())<=120: raise ValidationError('Name must contain 1–120 characters.')
    return Response(project_data(Project.objects.create(owner=request.user,name=name.strip())),status=201)

@api_view(['DELETE'])
def project_detail(request,pk):
    owned(request,pk).delete(); return Response(status=204)

@api_view(['POST'])
def upload(request,pk):
    project=owned(request,pk)
    archive=request.FILES.get('file')
    if archive is None: raise ValidationError('Provide a ZIP in the file field.')
    files=read_repository(archive)
    with transaction.atomic():
        Project.objects.select_for_update().get(pk=project.pk)
        project.files.all().delete()
        project.exchanges.all().delete()
        SourceFile.objects.bulk_create([SourceFile(project=project,path=p,content=c) for p,c in files])
    return Response({'indexed':len(files)})

@api_view(['GET'])
def files(request,pk):
    p=owned(request,pk)
    return Response(list(p.files.order_by('path').values('id','path')))

@api_view(['GET'])
def source(request,pk,file_id):
    p=owned(request,pk)
    f=get_object_or_404(SourceFile,pk=file_id,project=p)
    return Response({'id':f.id,'path':f.path,'content':f.content})

@api_view(['GET','POST'])
@throttle_classes([QuestionThrottle])
def questions(request,pk):
    p=owned(request,pk)
    if request.method=='GET': return Response(list(p.exchanges.order_by('id').values('id','question','answer','sources','mode','created_at')))
    q=request.data.get('question','')
    if not isinstance(q,str) or not 1<=len(q.strip())<=2000: raise ValidationError('Question must contain 1–2,000 characters.')
    if not p.files.exists(): raise ValidationError('Upload a repository first.')
    try: answer,sources,mode=answer_question(p,q.strip())
    except Exception:
        import logging
        logging.getLogger(__name__).exception('AI request failed')
        return Response({'detail':'AI provider request failed. Check backend configuration and try again.'},status=502)
    e=Exchange.objects.create(project=p,question=q.strip(),answer=answer,sources=sources,mode=mode)
    return Response({'id':e.id,'question':e.question,'answer':answer,'sources':sources,'mode':mode},status=201)

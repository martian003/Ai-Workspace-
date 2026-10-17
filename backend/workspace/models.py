from django.conf import settings
from django.db import models

class Project(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

class SourceFile(models.Model):
    project = models.ForeignKey(Project,on_delete=models.CASCADE,related_name='files')
    path = models.CharField(max_length=500)
    content = models.TextField()
    class Meta:
        constraints = [models.UniqueConstraint(fields=['project','path'],name='unique_project_path')]

class Exchange(models.Model):
    project = models.ForeignKey(Project,on_delete=models.CASCADE,related_name='exchanges')
    question = models.TextField()
    answer = models.TextField()
    sources = models.JSONField(default=list)
    mode = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

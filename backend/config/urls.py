from django.contrib import admin
from django.urls import path
from workspace import views as v
urlpatterns = [path('admin/',admin.site.urls),path('api/health/',v.health),path('api/auth/register/',v.register),path('api/auth/login/',v.login),path('api/auth/logout/',v.logout),path('api/projects/',v.projects),path('api/projects/<int:pk>/',v.project_detail),path('api/projects/<int:pk>/upload/',v.upload),path('api/projects/<int:pk>/files/',v.files),path('api/projects/<int:pk>/files/<int:file_id>/',v.source),path('api/projects/<int:pk>/questions/',v.questions)]

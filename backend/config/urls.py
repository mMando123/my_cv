from django.contrib import admin
from django.views.generic import TemplateView
from django.urls import include, path

urlpatterns = [
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
    path("admin/", admin.site.urls),
    path("api/", include("portfolio.urls")),
]

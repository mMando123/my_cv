from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactMessageCreateView, ProjectViewSet, SkillViewSet

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"skills", SkillViewSet, basename="skill")

urlpatterns = [
    path("", include(router.urls)),
    path("contact/", ContactMessageCreateView.as_view(), name="contact-create"),
]

from django.contrib import admin

from .models import ContactMessage, Project, Skill


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created_at")
    search_fields = ("name", "email", "message")
    list_filter = ("created_at",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "badge", "order")
    search_fields = ("title", "description", "role", "technologies")
    list_editable = ("order",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "category", "order")
    search_fields = ("name", "category")
    list_editable = ("level", "order")
    list_filter = ("category",)

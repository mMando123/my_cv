from rest_framework import serializers

from .models import ContactMessage, Project, Skill


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProjectSerializer(serializers.ModelSerializer):
    technologies_list = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "badge",
            "title",
            "description",
            "role",
            "technologies",
            "technologies_list",
            "link",
            "order",
            "created_at",
        ]

    def get_technologies_list(self, obj: Project):
        if not obj.technologies:
            return []
        return [t.strip() for t in obj.technologies.split(",") if t.strip()]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "level", "category", "order"]

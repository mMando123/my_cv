from django.db import models


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Project(models.Model):
    badge = models.CharField(max_length=40, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    role = models.CharField(max_length=120, blank=True)
    technologies = models.CharField(max_length=400, blank=True)
    link = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.title


class Skill(models.Model):
    name = models.CharField(max_length=160)
    level = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=120, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self) -> str:
        return self.name

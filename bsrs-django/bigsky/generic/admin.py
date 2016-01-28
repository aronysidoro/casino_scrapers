from django.contrib import admin

from generic import models


@admin.register(models.SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    pass


@admin.register(models.Setting)
class SettingAdmin(admin.ModelAdmin):
    pass

from django.conf import settings
from django.contrib.auth.models import ContentType
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.dispatch import receiver
from django.db.models import Q
from django.db.models.signals import post_save

from tenant.models import Tenant
from ticket.models import Ticket
from utils.fields import MyGenericForeignKey
from utils.models import BaseQuerySet, BaseManager, BaseModel


class AssignmentQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
            Q(description=keyword) |
            Q(assignee__username=keyword)
        )


class AssignmentManager(BaseManager):

    queryset_cls = AssignmentQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def process_ticket(self, tenant_id, ticket_id):
        """
        for each assignment-profile in this Tenant's Assignment Profiles
          does it match?
            match logic:
              for each profile filter in this Assingment Profile:
                do all filters's match? if so, it's an match for this
                assignment profile
          if match:
            assign ticket to that ap's assignee
            break out of for-loop

        """
        ticket = Ticket.objects.get(id=ticket_id)

        for assignment in self.filter(tenant__id=tenant_id).order_by('order'):
            match = assignment.is_match(ticket)
            if match:
                ticket.assignee = assignment.assignee
                ticket.save()
                break


class Assignment(BaseModel):
    tenant = models.ForeignKey(Tenant, null=True)
    order = models.IntegerField(null=True)
    description = models.CharField(max_length=500)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name="assignments")
    filters = GenericRelation("routing.ProfileFilter")

    objects = AssignmentManager()

    class Meta:
        ordering = ['order']

    def is_match(self, ticket):
        matches = []
        for f in self.filters.all():
            if f.is_match(ticket):
                matches.append(True)
            else:
                matches.append(False)
        return all(matches)


@receiver(post_save, sender=Assignment)
def update_order(sender, instance=None, created=False, **kwargs):
    "Post-save hook for incrementing order if not set"
    if instance.order is None:
        instance.order = Assignment.objects.filter(tenant=instance.tenant).count()
        instance.save()


class AvailableFilter(BaseModel):
    """
    :lookups: (dict)
        if there's a lookup, use it to generate dynamic AvailableFilters

        Idea for structure:
            {
                filters: if dynamic filters need to be generated of the base fields
                    ex - location_level,  on serialization generate an
                         available filter for each location_level
            }
    """
    key = models.CharField(max_length=100, blank=True,
                           help_text="To use for i18n UI key, and also for mapping component based on selected filter")
    key_is_i18n = models.BooleanField(default=True, help_text="is the 'key' field i18n'able")
    context = models.CharField(max_length=100, blank=True, default=settings.DEFAULT_PROFILE_FILTER_CONTEXT,
                               help_text="The namespace of the model to look the field up on. ex: 'app_name.model_name'")
    field = models.CharField(max_length=100,
                             help_text="Model field to look up from the Model class specified in the 'context'")
    lookups = JSONField(null=True, default={},
        help_text="if used, provide extra lookup information beyond the 'field'"
                  "this should be a string array")


class ProfileFilter(BaseModel):
    # key,context,field - need to be bootstrapped, or sent when going to AP view
    # will be different for NP, or AP
    key = models.CharField(max_length=100,
                           help_text="To use for i18n UI key, and also for mapping component based on selected filter")
    context = models.CharField(max_length=100, blank=True, default=settings.DEFAULT_PROFILE_FILTER_CONTEXT,
                               help_text="The namespace of the model to look the field up on. ex: 'app_name.model_name'")
    field = models.CharField(max_length=100,
                             help_text="Model field to look up from the Model class specified in the 'context'")
    criteria = JSONField(help_text="Must be a list. Criteria to match on.")
    # GenericForeignKey
    content_type = models.ForeignKey(ContentType, null=True)
    object_id = models.UUIDField(null=True)
    content_object = MyGenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['id']

    def is_match(self, ticket):
        # NOTE: checking the criteria will be different based on the "type"
        # of ticket, which is really an 'object' of diff types, i.e. 'work_order'
        field_type = ticket._meta.get_field(self.field)

        if isinstance(field_type, models.ManyToManyField):
            category_ids = (str(x) for x in ticket.categories.values_list('id', flat=True))
            return set(category_ids).intersection(set(self.criteria))
        elif isinstance(field_type, models.ForeignKey):
            return str(getattr(ticket, self.field).id) in self.criteria

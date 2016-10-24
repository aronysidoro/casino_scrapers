import re

from django.conf import settings
from django.template import loader

from utils.helpers import KwargsAsObject, get_model_class


class Interpolate(object):
    """
    Does string interplolation for Automation actions where a message
    needs to be sent. i.e email/sms
    """
    i18n_FIELDS = ['ticket.priority']

    def __init__(self, ticket, translation, **kwargs):
        """
        :param ticket: Ticket instance associated with the message
        :param automation:
            AutomationWrapper instance that uses kwargs as properties
            for info that's associated with the automation
        :param translation:
            Translation instance related to the message recipients' Locale
        """
        self.ticket = ticket
        self.translation = translation
        self.automation = KwargsAsObject(**kwargs)

        self.string_kwargs = {
            'ticket': self.ticket,
            'location': self.ticket.location,
            'automation': self.automation
        }

    def text(self, s):
        """
        Interpolate a string, and convert for use in text fields.
        i.e.  send_email subject and body

        :param s: string to interpolate
        """
        tags = self._get_raw_tags(s)
        for tag in tags:
            s = self._replace(s, tag)
        return s.format(**self.string_kwargs)

    def _get_raw_tags(self, s):
        e = re.compile('{{.*?}}')
        return e.findall(s)

    def _get_tags(self, s):
        e = re.compile('{{(.*?)}}')
        return e.findall(s)

    def _get_first_tag(self, s):
        return self._get_tags(s)[0]

    def _replace(self, string, substring):
        tag = self._get_first_tag(substring)

        if tag == 'ticket.url':
            return string.replace(substring, self._ticket_url())
        elif tag == 'ticket.activity':
            context = {'ticket': self.ticket}
            return loader.render_to_string('email/ticket-activities/email.txt', context)
        elif tag in self.i18n_FIELDS:
            model, field = tag.split('.')
            return string.replace(
                substring,
                self.translation.get_value(getattr(getattr(self.ticket, field), 'name')))
        return string.replace(substring, substring[1:-1])

    def _ticket_url(self):
        return '{}/tickets/{}'.format(settings.SITE_URL, self.ticket.id)

    def get_role_id(self, s):
        """
        Takes Role template tags, and returns an the `role.id`

        :param s: a single role template tag. i.e. {{role 'store mgr'}}
        """
        tag_data = self._get_tags(s)[0]
        Role = get_model_class("role")
        try:
            name = tag_data.split(' ')[1]
            # unwrap name from double string quotes, as a result from split()
            name = name.replace("'", '')
            return str(Role.objects.get(name=name).id)
        except IndexError:
            # not enough args
            return
        except Role.DoesNotExist:
            # TODO: may want to propagate exception here back to User,
            # who tried to tag a Role that doesn't exist
            return

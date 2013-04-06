from django.conf.urls import patterns, include, url
from woereader.forms import FormWithCaptcha
from registration.views import register
from django.views.generic import TemplateView
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'', include('ownreader.urls', namespace="ownreader")),
    url(r'^accounts/register/$', register,
        {'backend': 'registration.backends.default.DefaultBackend',
         'form_class': FormWithCaptcha},
        name='registration_register'),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^accounts/profile/$', 'ownreader.views.index', name='index'),
    url(r'^accounts/register/$', TemplateView.as_view(
        template_name='registration/activate.html')),
    url(r'^admin/', include(admin.site.urls)),
)

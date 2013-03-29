from django.conf.urls import patterns, include, url
from woereader.forms import FormWithCaptcha
from registration.views import register
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
    url(r'^admin/', include(admin.site.urls)),
)

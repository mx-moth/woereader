from django.conf.urls import patterns, include, url
from woereader.forms import FormWithCaptcha
from django.views.generic import TemplateView
from registration.backends.default.views import RegistrationView
from django.contrib import admin
admin.autodiscover()

class RecaptchaRegistrationView(RegistrationView):
    form_class = FormWithCaptcha

urlpatterns = patterns(
    '',
    url(r'', include('ownreader.urls', namespace="ownreader")),
    url(r'^accounts/register/$', RecaptchaRegistrationView.as_view(),
        name='registration_register'),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^accounts/profile/$', 'ownreader.views.index', name='index'),
    url(r'^admin/', include(admin.site.urls)),
)

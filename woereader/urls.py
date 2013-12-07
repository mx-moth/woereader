from django.conf.urls import patterns, include, url
from woereader.forms import FormWithCaptcha
from django.views.generic import TemplateView
from registration.backends.default.views import RegistrationView
from django.contrib.auth import views as auth_views
from django.contrib import admin
admin.autodiscover()

class RecaptchaRegistrationView(RegistrationView):
    form_class = FormWithCaptcha

urlpatterns = patterns(
    '',
    url(r'', include('ownreader.urls', namespace="ownreader")),
    url(r'^accounts/register/$', RecaptchaRegistrationView.as_view(),
        name='registration_register'),
    #override the default urls for django-registration's sake
    url(r'^password/change/$', auth_views.password_change,
        name='password_change'),
    url(r'^password/change/done/$', auth_views.password_change_done,
        name='password_change_done'),
    url(r'^password/reset/$', auth_views.password_reset,
        name='password_reset'),
    url(r'^password/reset/done/$', auth_views.password_reset_done,
        name='password_reset_done'),
    url(r'^password/reset/complete/$', auth_views.password_reset_complete,
        name='password_reset_complete'),
    url(r'^password/reset/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$',
        auth_views.password_reset_confirm,
        name='password_reset_confirm'),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^accounts/profile/$', 'ownreader.views.index', name='index'),
    url(r'^admin/', include(admin.site.urls)),
)

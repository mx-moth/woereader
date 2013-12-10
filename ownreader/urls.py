from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from ownreader.forms import AddFeedForm, AddFeedFormPreview

urlpatterns = patterns(
    '',
    url(r'^$', 'ownreader.views.index', name='index'),
    url(r'^addfeed/$', login_required(AddFeedFormPreview(AddFeedForm)),
        name='addFeed'),
    url(r'^update$', 'ownreader.views.update', name='UserUpdate'),
    url(r'^toggleRead$', 'ownreader.views.toggleRead', name="toggleRead"),
    url(r'^toggleShowRead$', 'ownreader.views.toggleShowRead', name="toggleShowRead"),
    url(r'^toggleSidebar$', 'ownreader.views.toggleSidebar', name="toggleSidebar"),
    url(r'^markRead$', 'ownreader.views.markRead', name="markRead"),
)

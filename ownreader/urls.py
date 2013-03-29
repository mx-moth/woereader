from django.conf.urls import patterns, url
from django.contrib.auth.decorators import login_required
from ownreader.forms import AddFeedForm, AddFeedFormPreview

urlpatterns = patterns(
    '',
    url(r'^$', 'ownreader.views.index', name='index'),
    url(r'^addfeed/$', login_required(AddFeedFormPreview(AddFeedForm)),
        name='addFeed'),
)

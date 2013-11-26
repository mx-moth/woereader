# Django settings for the woereader project.
import os
import djcelery
from datetime import timedelta
djcelery.setup_loader()

# Get .. as project root
PROJECT_ROOT = os.path.dirname(os.path.dirname((os.path.abspath(__file__))))

ACCOUNT_ACTIVATION_DAYS = 4
EMAIL_PORT = '587'
EMAIL_USE_TLS = True

# Grab the secrets/settings that change between deployments
try:
    from dev_settings import *
except ImportError:
    pass

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': DB_ENGINE,
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': '',
        'PORT': '',
    }
}

USE_L10N = True # Localised Date Formats
USE_TZ = True   # Timezone-awareness - nice for Celery

# Static Files
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static/')
STATIC_URL = PROJECT_URL + '/static/'
STATICFILES_DIRS = (
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)
ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'


TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'woereader.urls'

WSGI_APPLICATION = 'woereader.wsgi.application'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_ROOT, 'templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.formtools',
    'south',
    'registration',
    'captcha',
    'ownreader',
    'djcelery',
    'kombu.transport.django',
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

# Add the update task at the specified interval
CELERYBEAT_SCHEDULE = {
        'autoupdate': {
            'task': 'ownreader.tasks.CeleryUpdater',
            'schedule': timedelta(hours=1),
            },
        }

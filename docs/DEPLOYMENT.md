# Deployment path

The project has not been deployed to a hosting account. Dockerfiles and production settings are supplied; provisioning a server, domain, database and credentials is still required. Docker images are not verified until built on your host.

## Simple Linux VPS path

1. Install Docker Engine and Compose. Upload this source to a server. Use a private Git repository and keep environment files out of Git.
2. Create a root `.env` for Compose. Set a long random DJANGO_SECRET_KEY, a strong POSTGRES_PASSWORD (URL-safe characters, or URL-encode it in DATABASE_URL), DEBUG=false, ALLOWED_HOSTS=api.example.com, CORS_ALLOWED_ORIGINS=https://app.example.com, NEXT_PUBLIC_API_URL=https://api.example.com/api, and optional OPENAI_API_KEY/OPENAI_MODEL. The frontend API URL is baked in at build time: rebuild after changing it.
3. Put a trusted TLS reverse proxy in front of both loopback ports. A Caddy example is included. Replace the example domains and configure DNS first. Keep the database unexposed.
4. For a proxy that terminates TLS, add `SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')` in settings ONLY when that proxy strips/overwrites client-supplied forwarded headers and direct access to Django is blocked. Otherwise SSL redirects can loop. The supplied Caddy config overwrites this header and Compose binds Django to loopback.
5. Run `docker compose up --build -d`. The backend applies migrations and collects static assets before Gunicorn starts. For multiple replicas, move migrations into one release job instead.
6. Run `docker compose exec backend python manage.py check --deploy`. Confirm HTTPS redirects, registration, login, a ZIP upload and questions using your real domain. Test with two accounts to verify isolation.
7. Back up PostgreSQL regularly using pg_dump and test restoration. Source and conversations are stored in the database, not a file volume. Keep API keys in server-managed secrets. Rotate them if exposed.

Gunicorn runs the Django WSGI app, not the development runserver. The frontend uses Next.js standalone output. Long AI requests have a finite timeout; repository indexing remains synchronous, so keep the MVP limits.

Before a public multi-user launch, add per-user storage quotas, abuse controls at the proxy, Redis-backed throttling, password reset, error monitoring, provider cost limits, and a documented source-code retention/deletion policy. Configure proxy body limits slightly above the 10 MB upload limit and request timeouts above the model timeout. Do not treat Django's in-process throttle cache as a distributed abuse defense.

## Optional managed hosting

Use one Python/container service for the backend, a PostgreSQL database and a Node/container service for the frontend. Set the same environment variables, run migrations as a release step, expose Gunicorn on the provider's expected port, and configure trusted proxy handling according to that provider. No provider account, paid resource or public deployment was created by this build.

Official reference: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

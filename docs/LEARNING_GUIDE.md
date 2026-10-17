# Learn Django through this project

Read in this order:

1. `backend/manage.py`: entry point for management commands such as migrate, test, runserver.
2. `backend/config/settings.py`: installed apps, middleware, database, authentication and production settings.
3. `backend/config/urls.py`: URL patterns map requests to views.
4. `backend/workspace/models.py`: Project, SourceFile and Exchange describe database rows. Foreign keys express ownership and relationships. Migrations record schema changes.
5. `backend/workspace/views.py`: API views validate input, enforce ownership, call services, and return JSON responses. `owned()` filters by request.user so another user's project ID does not grant access.
6. `backend/workspace/services.py`: repository ingestion, retrieval and the external AI call. Keep this logic out of HTTP handling so it is easier to test.
7. `backend/workspace/tests.py`: integration tests exercise authentication, object access, ZIP validation and the ask flow.
8. `frontend/app/page.tsx`: fetch sends requests to Django, authenticates with the Authorization header, and renders JSON results.

## Trace a request

When you upload: browser builds multipart FormData → Django URL resolver selects upload() → token authentication sets request.user → owned() checks the project → read_repository() validates ZIP metadata and reads text → atomic transaction replaces database rows → JSON indexed count → React refreshes the explorer.

When you ask: POST question → question validation → retrieve() ranks overlapping source windows → optional provider call → Exchange row saved → JSON answer and source references → React renders it.

## Exercises for later

1. Add a project description field. Make a migration and include it in the response and form.
2. Add a GET project detail endpoint; ensure another user receives 404.
3. Move input validation into DRF serializers and explain why serializer validation belongs at the API boundary.
4. Add tests for ZIP limits and case-sensitive paths.
5. Replace keyword retrieval with embeddings stored in PostgreSQL/pgvector while preserving file/line metadata.
6. Move uploads to background jobs with explicit queued/running/failed/ready states before increasing repository limits.

The first version uses function views and explicit validation to make request handling easy to trace. DRF serializers/viewsets and Celery can be introduced when their purpose is concrete.

FROM python:3.11
LABEL org.opencontainers.image.source=https://github.com/vedangnaik/degreeexplorerplusplus
LABEL org.opencontainers.image.description="Production image for Degree Explorer++."
LABEL org.opencontainers.image.licenses=MIT
COPY . /degreeexplorerplusplus
EXPOSE 8000
CMD ["python", "-m", "http.server", "-d", "/degreeexplorerplusplus"]
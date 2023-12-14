#Login
Write-Host "To work, you need to have logged in to the repository"
docker login

# Run docker-compose build
docker-compose build

# Release number
$release = "demo_3"

# Docker Hub repository
$dockerhub_repo = "matitaviola/thesis_management_06"

# Tags
$server_tag = $dockerhub_repo+":server_release_"+$release
$client_tag = $dockerhub_repo+":client_release_"+$release

#Tag and push se2_thesis-management-backend
docker tag "se2_thesis-management-backend:latest" "$server_tag"
docker push "$server_tag"

#Tag and push se2_thesis-management-frontend
docker tag "se2_thesis-management-frontend:latest" "$client_tag"
docker push "$client_tag"



Write-Host "Build and push completed."

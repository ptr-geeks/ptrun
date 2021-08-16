# Before you build an image
1. Install Docker (if you don't have it already)
2. Execute go mod vendor: `go mod vendor`

# Here is how you build a docker image
```sh
sudo docker build -t ptrun-server .
```

# Run a docker container
If you want to run it in terminal (with direct output):
```sh
sudo docker run -p 8080:8080 ptrun-server
```
In background:
```sh
sudo docker run -p 8080:8080 -d ptrun-server
```

# Get all running containers
### **IMPORTANT: You can obtain container name/ID using this command**
```sh
sudo docker ps
```

# Stop a container
```sh
sudo docker stop <container name or id>
```


# Get IP address of container
```sh
sudo docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container name or id>
```


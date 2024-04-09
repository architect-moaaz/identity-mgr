# Dockerizing ifs-Data-Mgr
 Step 1: Create the Dockerfile 
  --- 
     command used: touch Dockerfile
   ---- 
 step 2: Build the docker image.
   ---
    command used: sudo docker build -t tentoro/tentoro-identity-manager --build-arg PROFILE=colo .
   ---
   step 3: Run the docker image.
   ----
    command used: sudo docker run -p 31523:31523 tentoro/tentoro-identity-manager
     ---
     The above command starts the data manager image inside the container and exposes port 31523 inside container to port 31523 outside the container.
     ----

   step 4: Check the image created 
   ---
    command used: docker images
   ---
 step 5:Access the route on server using http://localhost:31523


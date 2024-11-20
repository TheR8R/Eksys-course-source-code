FROM gradle:7.5.1-jdk18

# Tell Java Tools that source files are encoded in UTF-8
ENV Java_Tool_Options -Dfile.encoding=UTF8

# Set working directory
WORKDIR /root/todo

# Copy all files from current directory to working directory
COPY . .

# Build the project
RUN gradle build

# Default port exposed
EXPOSE 8080

# Default command to run
CMD [ "gradle", "todo" ] 
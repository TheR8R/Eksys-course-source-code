import static spark.Spark.*;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Timestamp;

import org.eclipse.jetty.http.MetaData.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import database.SQLiteDB;

public class TodoApp {

    private static SQLiteDB db = new SQLiteDB();

    private static int highestId;
    public static String commonTimeStamp = "0";

    public static void main(String[] args) {
        try {
            highestId = db.getHighestId();
        } catch (Exception e) {
            System.out.println(e);
        }

        port(8080);

        staticFiles.externalLocation("client/");
        Path filePath = Path.of("client/index.html");

        try {
            String html = Files.readString(filePath);
            get("/", (req, res) -> html);
        } catch (Exception e) {
            System.out.println(e);
        }

        /**
         * get todo handler returns all the todos in the given section
         * 
         * @return {json} json list with all the requested todos
         * 
         *         The client code imples a contract:
         *         calling the server with GET on /todo should return all todos
         */
        get("/todo/:section/:sorting", (req, res) -> {
            // db.readDataBase();
            String section = req.params(":section");
            String sorting = req.params(":sorting");
            return db.getTodosFromSection(section, sorting);
        });

        /**
         * get single todo from database
         * 
         * @return {json} jsonObject with the requested todo by id
         */
        get("/singleTodo/:id", (req, res) -> {
            int id = Integer.parseInt(req.params(":id")); // Get the id from the request
            // return single todo
            return db.getSingleTodoFromDatabase(id);
        });

        post("/checkUpdate/:timestamp", (req, res) -> {
            String timestamp = req.params(":timestamp");
            JSONObject response = new JSONObject();
            if (timestamp.equals(commonTimeStamp)) {
                response.put("notify", false);
                return response;
            } else {
                response.put("notify", true);
                return response;
            }
        });

        /**
         * post todo handler adds a todo to the list
         * 
         * @return {json} todo object with id and todo
         *         The client code imples a contract:
         *         calling the server with POST on /todo should add the incoming todo to
         *         our todoList and return the object with an id
         *         {id: <id>, todo: <todotext>}
         */
        post("/todo", (req, res) -> {
            JSONObject todo = new JSONObject(req.body());
            highestId = db.getHighestId() + 1;
            todo.put("id", highestId);
            String timestamp = db.insertTodoIntoDatabase(todo);
            if (timestamp != null) {
                commonTimeStamp = timestamp;
            }
            JSONObject response = new JSONObject();
            response.put("timestamp", timestamp);
            return response;
        });

        /**
         * Delete todo handler deletes the todo with a specific id (/todo/:id)
         * 
         * @return {status} returns statuscode 204 (no content) to confirm
         *         The client code imples a contract:
         *         calling the server with DELETE on /todo should remove the todo with
         *         the provided id.
         */
        delete("/todo/:id", (req, res) -> {
            int id = Integer.parseInt(req.params(":id")); // Get the id from the request
            db.deleteTodo(id);
            return 204;
        });

        put("/todo/:id", (req, res) -> {
            int id = Integer.parseInt(req.params(":id")); // Get the id from the request
            db.updateSection(id, "COMPLETED");
            return 200;
        });

        put("/updateTodo/:id", (req, res) -> {
            JSONObject todo = new JSONObject(req.body());
            int id = Integer.parseInt(req.params(":id")); // Get the id from the request
            todo.put("id", id);
            db.updateTodoFromDatabase(todo);
            return 200;
        });

        get("/getTimestamp", (req, res) -> {
            // return single todo
            JSONObject response = new JSONObject();
            response.put("timestamp", commonTimeStamp);
            return response;
        });

    }

    // private static JSONArray generateTodoList() {
    // JSONArray todoList = new JSONArray();

    // String[] todoStrings = { "Add client code to your example",
    // "Make sure the CSS and JavaScript is in the correct folder",
    // "Run your server to verify the static files", "Implement the GET
    // todoHandler",
    // "Implement the POST todoHandler", "Implement the DELETE todoHandler" };
    // for (int i = 0; i < todoStrings.length; i++) {
    // JSONObject todo = new JSONObject();
    // todo.put("todo", todoStrings[i]);
    // todo.put("id", i);
    // todoList.put(todo);
    // }
    // return todoList;
    // }
}
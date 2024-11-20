package database;

import java.sql.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.xml.transform.Result;

import java.sql.Date;

import org.eclipse.jetty.security.authentication.AuthorizationService;
import org.json.JSONArray;
import org.json.JSONObject;

public class SQLiteDB {
    private static Connection connection = null;
    private static Statement statement = null;
    private static ResultSet resultSet = null;

    // public static void main(String[] args) {
    // // createTable();
    // // try {
    // // insertTodoIntoDatabase(1, "woop woop", "2024-02-02", 1, "AFVENTER", "",
    // // "VINNIE", "VINNIE");

    // // } catch (Exception e) {
    // // System.out.println(e);
    // // }
    // try {
    // // JSONObject json = new JSONObject();
    // // json.put("id", 1);
    // // json.put("title", "testi test");
    // // json.put("deadline", "2030-03-03");
    // // json.put("priority", 1);
    // // json.put("status", "AFVENTER");
    // // json.put("description", "test");
    // // json.put("author", "TOA");
    // // json.put("section", "TOA");
    // // updateTodoFromDatabase(json);

    // // JSONArray jsa = getTodosFromSection("VINNIE");
    // // JSONObject jso = getSingleTodoFromDatabase(2);

    // // int i = getHighestId();
    // // System.out.println(i);

    // // updateAuthor(2, "VINNIE");
    // // updateSection(2, "VINNIE");

    // // getSingleTodoFromDatabase(1);
    // // getSingleTodoFromDatabase(2);

    // clearDB();

    // } catch (Exception e) {
    // System.out.println(e);
    // }
    // }

    public JSONArray getTodosFromSection(String section, String sorting) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");
            // db parameters
            String url = "jdbc:sqlite:todos.db";

            // create a connection to the database
            connection = DriverManager.getConnection(url);
            Statement statement;
            String sql;
            JSONArray resultArray = new JSONArray();

            if (sorting.equals("priority")) {
                sql = String.format("SELECT * FROM todos WHERE section='%s' AND priority='High'", section);
                statement = connection.createStatement();
                resultSet = statement.executeQuery(sql);
                addEntriesToArray(resultSet).forEach(todo -> resultArray.put(todo));

                sql = String.format("SELECT * FROM todos WHERE section='%s' AND priority='Medium'", section);
                statement = connection.createStatement();
                resultSet = statement.executeQuery(sql);
                addEntriesToArray(resultSet).forEach(todo -> resultArray.put(todo));

                sql = String.format("SELECT * FROM todos WHERE section='%s' AND priority='Low'", section);
                statement = connection.createStatement();
                resultSet = statement.executeQuery(sql);
                addEntriesToArray(resultSet).forEach(todo -> resultArray.put(todo));

            } else {
                sql = String.format("SELECT * FROM todos WHERE section='%s' ORDER BY %s DESC", section, sorting);
                statement = connection.createStatement();
                resultSet = statement.executeQuery(sql);

                addEntriesToArray(resultSet).forEach(todo -> resultArray.put(todo));

            }

            return resultArray;

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }

    }

    // public JSONArray getTodosFromSection(String section) throws Exception {
    // try {

    // Class.forName("org.sqlite.JDBC");
    // // db parameters
    // String url = "jdbc:sqlite:todos.db";

    // // create a connection to the database
    // connection = DriverManager.getConnection(url);

    // String sql = "SELECT * FROM todos WHERE section=?";
    // PreparedStatement statement = connection.prepareStatement(sql);
    // statement.setString(1, section);

    // resultSet = statement.executeQuery();

    // JSONArray resultArray = new JSONArray();

    // if (!resultSet.isBeforeFirst()) {
    // return resultArray;
    // }

    // while (resultSet.next()) {
    // JSONObject todo = new JSONObject();
    // todo.put("title", resultSet.getString(2));
    // todo.put("deadline", resultSet.getDate(3));
    // todo.put("priority", resultSet.getString(4));
    // todo.put("status", resultSet.getString(5));
    // todo.put("description", resultSet.getString(6));
    // todo.put("author", resultSet.getString(7));
    // todo.put("section", resultSet.getString(8));
    // todo.put("id", resultSet.getInt(1));

    // resultArray.put(todo);
    // }

    // return resultArray;

    // } catch (Exception e) {
    // throw e;
    // } finally {
    // close();
    // }

    // }

    public static void createTable() {

        String url = "jdbc:sqlite:todos.db";

        String sql = "CREATE TABLE IF NOT EXISTS todos (\n"
                + " id integer PRIMARY KEY, \n"
                + " title text NOT NULL, \n"
                + " deadline date, \n"
                + " priority text NOT NULL, \n"
                + " status text NOT NULL, \n"
                + " description text NOT NULL, \n"
                + " author text NOT NULL, \n"
                + " section text NOT NULL);";

        try (Connection conn = DriverManager.getConnection(url);
                Statement stmt = conn.createStatement()) {
            // create a new table
            stmt.execute(sql);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

    }

    public JSONObject getSingleTodoFromDatabase(int id) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");
            // db parameters
            String url = "jdbc:sqlite:todos.db";

            // create a connection to the database
            connection = DriverManager.getConnection(url);

            String sql = "SELECT * FROM todos WHERE id=?";

            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setInt(1, id);

            resultSet = statement.executeQuery();

            JSONObject todo = new JSONObject();

            while (resultSet.next()) {
                todo.put("id", resultSet.getInt(1));
                todo.put("title", resultSet.getString(2));
                todo.put("deadline", resultSet.getDate(3));
                todo.put("priority", resultSet.getString(4));
                todo.put("status", resultSet.getString(5));
                todo.put("description", resultSet.getString(6));
                todo.put("author", resultSet.getString(7));
                todo.put("section", resultSet.getString(8));
            }

            return todo;

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    /**
     * Insert a row into database
     * 
     * @param JSONObject which represents a row
     */
    public String insertTodoIntoDatabase(JSONObject json) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");

            // db parameters
            String url = "jdbc:sqlite:todos.db";
            connection = DriverManager.getConnection(url);

            String sql = "INSERT INTO todos (id, title, deadline, priority, status, description, author, section)"
                    + " VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setInt(1, json.getInt("id"));
            statement.setString(2, json.getString("title"));
            if (json.getString("deadline") == "") {
                statement.setDate(3, null);
            } else {
                statement.setDate(3, java.sql.Date.valueOf(json.getString("deadline")));
            }
            statement.setString(4, json.getString("priority"));
            statement.setString(5, json.getString("status"));
            statement.setString(6, json.getString("description"));
            statement.setString(7, json.getString("author"));
            statement.setString(8, json.getString("section"));

            statement.executeUpdate();

            if (json.getString("section").equals("COMMON")) {
                return String.valueOf(System.currentTimeMillis());
            } else {
                return null;
            }

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    public int getHighestId() throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");
            // db parameters
            String url = "jdbc:sqlite:todos.db";

            // create a connection to the database
            connection = DriverManager.getConnection(url);

            String sql = "SELECT MAX(id) FROM todos;";

            statement = connection.createStatement();

            resultSet = statement.executeQuery(sql);

            return resultSet.getInt(1);

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    public void updateSection(int id, String section) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");
            // db parameters
            String url = "jdbc:sqlite:todos.db";

            // create a connection to the database
            connection = DriverManager.getConnection(url);

            String sql = "UPDATE todos SET section=? WHERE id=?";

            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, section);
            statement.setInt(2, id);

            statement.executeUpdate();

            if (section == "COMPLETED") {
                sql = "UPDATE todos SET status=? WHERE id=?";
                statement = connection.prepareStatement(sql);
                statement.setString(1, "Afsluttet");
                statement.setInt(2, id);
                statement.executeUpdate();
            }

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    public void updateAuthor(int id, String author) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");
            // db parameters
            String url = "jdbc:sqlite:todos.db";

            // create a connection to the database
            connection = DriverManager.getConnection(url);

            String sql = "UPDATE todos SET author=? WHERE id=?";

            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, author);
            statement.setInt(2, id);

            statement.executeUpdate();

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    public void deleteTodo(int id) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");
            // db parameters
            String url = "jdbc:sqlite:todos.db";

            // create a connection to the database
            connection = DriverManager.getConnection(url);

            String sql = "DELETE FROM todos WHERE id=?";

            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setInt(1, id);

            statement.executeUpdate();

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    public void updateTodoFromDatabase(JSONObject json) throws Exception {
        try {

            Class.forName("org.sqlite.JDBC");

            // db parameters
            String url = "jdbc:sqlite:todos.db";
            connection = DriverManager.getConnection(url);

            String sql = "UPDATE todos SET title=?, deadline=?, priority=?, status=?, description=?, author=?, section=? WHERE id=?";

            PreparedStatement statement = connection.prepareStatement(sql);
            statement.setString(1, json.getString("title"));
            if (json.getString("deadline") == "") {
                statement.setDate(2, null);
            } else {
                statement.setDate(2, java.sql.Date.valueOf(json.getString("deadline")));
            }
            statement.setString(3, json.getString("priority"));
            statement.setString(4, json.getString("status"));
            statement.setString(5, json.getString("description"));
            statement.setString(6, json.getString("author"));
            statement.setString(7, json.getString("section"));
            statement.setInt(8, json.getInt("id"));

            statement.executeUpdate();

        } catch (Exception e) {
            throw e;
        } finally {
            close();
        }
    }

    public static void clearDB() throws Exception {
        try {
            Class.forName("org.sqlite.JDBC");

            // db parameters
            String url = "jdbc:sqlite:todos.db";
            connection = DriverManager.getConnection(url);

            String sql = "DROP TABLE IF EXISTS todos";
            Statement statement = connection.createStatement();
            statement.executeUpdate(sql);

            createTable();

        } catch (Exception e) {
            System.out.println(e);
        } finally {
            close();
        }
    }

    public JSONArray addEntriesToArray(ResultSet resultSet) {
        JSONArray resultArray = new JSONArray();
        try {
            if (!resultSet.isBeforeFirst()) {
                return resultArray;
            }
            while (resultSet.next()) {
                JSONObject todo = new JSONObject();
                todo.put("id", resultSet.getInt(1));
                todo.put("title", resultSet.getString(2));
                todo.put("deadline", resultSet.getDate(3));
                todo.put("priority", resultSet.getString(4));
                todo.put("status", resultSet.getString(5));
                todo.put("description", resultSet.getString(6));
                todo.put("author", resultSet.getString(7));
                todo.put("section", resultSet.getString(8));

                resultArray.put(todo);
            }
        } catch (Exception e) {
            System.out.println(e);
        }
        return resultArray;
    }

    // You need to close the resultSet
    private static void close() {
        try {
            if (resultSet != null) {
                resultSet.close();
            }

            if (statement != null) {
                statement.close();
            }

            if (connection != null) {
                connection.close();
            }
        } catch (Exception e) {

        }
    }

}
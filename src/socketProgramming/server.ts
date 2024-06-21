import { Server, Socket } from "socket.io";
import AuthService from "../Services/authentication";
import { UserRoleService } from "../Services/userRole";
import * as dotenv from 'dotenv';
import AdminController from "../Controller/admin";
import ChefController from "../Controller/chef";

dotenv.config();

class CafeteriaManagementServer {
  private io: Server;
  private authService: AuthService;
  private roleService: UserRoleService;
  private adminController: AdminController;
  private chefController: ChefController;

  constructor(port) {
    this.io = new Server(port);
    this.authService = new AuthService();
    this.roleService = new UserRoleService();
    this.adminController = new AdminController();
    this.chefController = new ChefController();
    console.log("Server is running on port:", port, "\n Waiting for connections...");
    this.io.on("connection", (socket: Socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    console.log('A client is now connected with id :', socket.id);

    socket.on("Authenticate", async (userCreds: any) => {
      console.log("\nReceived from client:", userCreds);
      await this.handleLogin(socket, userCreds);
    });

    socket.on("disconnect", () => {
      console.log(`Client ${socket.id} disconnected :( `,);
    });
  }

  private async handleLogin(socket: Socket, userCreds: any) {
    try {
      const loginUser = await this.authService.validateUser(
        userCreds.email,
        userCreds.password
      );
      if (!loginUser) {
        socket.emit("login", null); 
      } else {
        const userRole = await this.roleService.getById(loginUser.roleId);
        socket.emit("login", {name: loginUser.name, role: userRole.roleName});
        this.handleUserOptions(socket, userRole.roleName);
      }
    } catch (error) {
      console.log("Error during login:", error);
      socket.emit("login", null);
    }
  }

  private handleUserOptions(socket: Socket, role: string) {
    socket.on("user-options", async (response: any) => {
      console.log("Received from client:", response);
      const role = response.role;
      const payload = response.payload;
      
      switch(role) {
        case 'Admin':
          socket.emit("option-response", { selectedOption: payload.selectedOption, response: await this.adminController.handleRequest(payload)});
          break;
        case 'Chef':
          socket.emit("option-response", { selectedOption: payload.selectedOption, response: await this.chefController.handleRequest(payload)});
          break;
        case 'Employee':
          socket.emit("option-response", {role: role, selectedOption: payload.selectedOption, response: "Customer here"});
          break;
      }

    });

    socket.on("feedback/getRolledoutItems", async (message: any) => {
      console.log("Received from client:", message);
      // const rolledoutItems = await this.chefController.getRolledoutItems();
      // socket.emit("feedback/rolledoutItems", rolledoutItems);
    });



  }

}


const server = new CafeteriaManagementServer(process.env.SERVER_PORT);

export default CafeteriaManagementServer;

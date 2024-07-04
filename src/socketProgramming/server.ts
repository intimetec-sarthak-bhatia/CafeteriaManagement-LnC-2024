import { Server, Socket } from "socket.io";
import AuthService from "../Services/authentication";
import { UserRoleService } from "../Services/userRole";
import * as dotenv from 'dotenv';
import AdminController from "../Server-Controller/admin.server";
import ChefController from "../Server-Controller/chef.server";
import { ResponseInterface } from "../Interface/response";
import EmployeeController from "../Server-Controller/employee.server";
import { UserRole } from "../enums/userRoles.enum";
import { SocketEvent } from "../enums/socketEvent.enum";

dotenv.config();

class CafeteriaManagementServer {
  private io: Server;
  private authService: AuthService;
  private adminController: AdminController;
  private chefController: ChefController;
  private employeeController: EmployeeController;

  constructor(port) {
    this.io = new Server(port);
    this.authService = new AuthService();
    this.adminController = new AdminController();
    this.chefController = new ChefController();
    this.employeeController = new EmployeeController();
    console.log("Server is running on port:", port, "\n Waiting for connections...");
    this.io.on(SocketEvent.SERVER_CONNECTION, (socket: Socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    console.log('A client is now connected with id :', socket.id);

    socket.on(SocketEvent.AUTHETICATION, async (userCreds: any) => {
      console.log("\nReceived from client:", userCreds);
      await this.handleLogin(socket, userCreds);
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      console.log(`Client ${socket.id} disconnected :( `,);
    });
  }

  private async handleLogin(socket: Socket, userCreds: any) {
    try {
      const user = await this.authService.validateUser(
        userCreds.email,
        userCreds.password
      );
      if(user){
        socket.emit(SocketEvent.LOGIN, {name: user.name, role: user.role, id:user.id});
        this.handleUserOptions(socket);
      }
    } catch (error) {
      console.log("Error during login:", error);
      socket.emit(SocketEvent.LOGIN, {error: error.message});
    }
  }

  private handleUserOptions(socket: Socket) {
    socket.on(SocketEvent.REQUEST, async (request: any) => {
      console.log("Received from client:", request);
      const role = request.user.role;
      const payload = {user: request.user, selectedOption: request.selectedOption, data: request.data};
      let response: ResponseInterface = {user: request.user, selectedOption: request.selectedOption}
      let result: ResponseInterface;
      try{
        switch(role) {
          case UserRole.Admin:
            result = await this.adminController.handleRequest(payload)
            break;
          case UserRole.Admin:
            result = await this.chefController.handleRequest(payload)
            break;
          case UserRole.Employee:
            result = await this.employeeController.handleRequest(payload)
            break;
        }
        socket.emit(SocketEvent.RESPONSE, {...result, ...response});
      }
      catch(error) {
        console.log(error);
        socket.emit(SocketEvent.RESPONSE, {user: request.user, data: error.message, dataType: 'message', event: 'error'})
      }
      

    });
  }

}

const server = new CafeteriaManagementServer(process.env.SERVER_PORT);

export default CafeteriaManagementServer;

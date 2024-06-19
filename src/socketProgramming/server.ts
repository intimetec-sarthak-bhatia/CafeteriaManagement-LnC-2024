import { Server, Socket } from "socket.io";
import { UserService } from "../Services/user";
import AuthService from "../Services/authentication";
import { UserRoleService } from "../Services/userRole";

class CafeteriaManagementServer {
  private io: Server;
  private userService: UserService;
  private authService: AuthService;
  private roleService: UserRoleService;

  constructor(port: number) {
    this.io = new Server(port);
    this.userService = new UserService();
    this.authService = new AuthService();
    this.roleService = new UserRoleService();

    this.io.on("connection", (socket: Socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    console.log('A client is now connected with id :', socket.id);

    socket.on("user-creds", async (userCreds: any) => {
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
      }
    } catch (error) {
      console.log("Error during login:", error);
      socket.emit("login", null);
    }
  }

}

const server = new CafeteriaManagementServer(4000);

export default CafeteriaManagementServer;

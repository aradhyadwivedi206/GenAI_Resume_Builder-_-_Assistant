import{createBrowserRouter} from "react-router-dom";

import Login from "./features/auth/Pages/Login.jsx"
import Register from "./features/auth/Pages/Register.jsx"
import { Protected } from "./features/auth/components/protected.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/interview.jsx";

export const router=createBrowserRouter([
    {
        path:"/login",
        element:<Login/>

},
{
    path:"/register",
    element:<Register/>
},
{
    path:"/",
    element:<Protected><Home/></Protected>

},
{
     path:"/interview/:interviewId",
    element:<Protected><Interview/></Protected>
}
])
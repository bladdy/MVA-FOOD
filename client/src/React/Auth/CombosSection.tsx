import { UserProvider } from "@/context/UserContext";
import ComboManager from "../Admin/ComboManager";


const CombosSection = ({}) =>{
    return(
        <UserProvider>
            <ComboManager/>
        </UserProvider>

    );
}
export default CombosSection;
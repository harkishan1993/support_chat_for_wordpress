"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserAndAgentDetail} from "../../redux/conversationSlice";
import { useAuthContext } from "../../app/_context/AuthContext";
const useSendRequestForAsignAssistance = () => {
    const dispatch = useDispatch();
    const { userId } = useAuthContext();
        const getUserDataWithAsingAssistance = async () => {
            const formdata = new FormData()
            formdata.append("u_id", userId)
            formdata.append("message", "Support")
            formdata.append("token","GOafiDOGFDB06EtcfjZ2vbsy3baLlwzeMsl1TFOMLDeYgjys6UOcg1XPMeOwPyC0")
            console.log(formdata)

            try {
                const res = await fetch(`https://mytestapp.org.in/order_chat/wp-json/itpl-api/v1/user_message_request`,{
                    method: "POST",
                    body: formdata
                });
                const data = await res.json();
                dispatch(setUserAndAgentDetail(data));
                return data
            } catch (error) {
                toast.error(error.message);
                return null
            } finally {
        
            }
        };
  

    return { getUserDataWithAsingAssistance };
};
export default useSendRequestForAsignAssistance;

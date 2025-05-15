import axios from "axios";

export async function postData(link, data){
    try{
        const res = await axios.post(`https://barangayapi.vercel.app/${link}`, data)
        return res.data
    }
    catch(err){
        return err
    }
}

export async function putData(link, id, data){
    try{
        const res = await axios.put(`https://barangayapi.vercel.app/${link}/${id}`, data)
        return res.data
    }
    catch(err){
        return err
    }
}

export async function deleteData(link, id){
    console.log(id)
    try{
        const res = await axios.delete(`https://barangayapi.vercel.app/${link}/${id}`)
        return res.data
    }
    catch(err){
        return err
    }
}

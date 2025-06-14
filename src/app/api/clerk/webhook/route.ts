import { db } from "@/server/db"


export const POST = async (req: Request) => {
    const {data, type} = await req.json()
    console.log('clerk webhook type: ', type)
    console.log('clerk webhook data: ', data)

    if (type === "user.created") {
        console.log('user created webhook type? : ', type)
        const emailAddress = data.email_addresses[0].email_address
        const firstName = data.first_name
        const lastName = data.last_name
        const imageUrl = data.image_url
        const id = data.id

        try {
            await db.user.create({
                data: {
                    id: id,
                    emailAddress: emailAddress,
                    firstName: firstName,
                    lastName: lastName,
                    imageUrl: imageUrl
                }
            })
            console.log("user created successfully")
        } catch (error) {
            console.error("The error: ", error)
            return new Response("User creation error", {status: 500})
        }
    }

    if (type === "user.updated") {
        console.log('user updated webhook type? : ', type)
        const emailAddress = data.email_addresses[0].email_address
        const firstName = data.first_name
        const lastName = data.last_name
        const imageUrl = data.image_url
        const id = data.id

        try {
            await db.user.update({
                where: { id: id },
                data: {
                    emailAddress: emailAddress,
                    firstName: firstName,
                    lastName: lastName,
                    imageUrl: imageUrl
                }
            })
            console.log("user updated successfully")
        } catch (e) {
            console.log("The error", e)
            return new Response("User update error", {status: 500})
        }
    }

    if (type === "user.deleted") {
        console.log('user deleted webhook type? : ', type)
        const id = data.id

        try {
            await db.user.delete({
                where: { id: id }
            })
            console.log("user deleted successfully")
        } catch (error) {
            console.error("The error: ", error)
            return new Response("User deletion error", {status: 500})
            
        }
    }

    return new Response("Webhook received", {status: 200})
}
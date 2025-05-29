import { db } from "@/server/db"
// import { PrismaClient } from '../../../../../generated/prisma/client'

// const prisma = new PrismaClient()


export const POST = async (req: Request) => {
    const {data, type} = await req.json()
    // console.log('clerk webhook type: ', type)
    console.log('clerk webhook data: ', data)

    if (type === "user.created") {
        const emailAddress = data.email_addresses[0].email_address
        const firstName = data.first_name
        const lastName = data.last_name
        const imageUrl = data.image_url
        const id = data.id

        async function createUser() {
            await db.user.create({
                data: {
                    id: id,
                    emailAddress: emailAddress,
                    firstName: firstName,
                    lastName: lastName,
                    imageUrl: imageUrl
                }
            })
        }

        createUser()
        .then(async () => {
            console.log("user created successfully")
            // await db.$disconnect()
        })
        .catch(async (e) => {
            console.error("The error: ",e)
            // await db.$disconnect()
            // console.log("error", e)
            return new Response("User creation error", {status: 500})
        })
    }

    if (type === "user.updated") {
        console.log('user updated webhook type? : ', type)
        const emailAddress = data.email_addresses[0].email_address
        const firstName = data.first_name
        const lastName = data.last_name
        const imageUrl = data.image_url
        const id = data.id

        // async function updateUser() {
        //     await db.user.update({
        //         where: { id: id },
        //         data: {
        //             emailAddress: emailAddress,
        //             firstName: firstName,
        //             lastName: lastName,
        //             imageUrl: imageUrl
        //         }
        //     })
        // }

        // updateUser()
        // .then(async () => {
        //     console.log("user updated successfully")
        //     // await db.$disconnect()
        // })
        // .catch(async (e) => {
        //     console.error("The error: ", e)
        //     // await db.$disconnect()
        //     // console.log("error", e)
        //     return new Response("User update error", {status: 500})
        // })
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
        const id = data.id

        async function deleteUser() {
            await db.user.delete({
                where: { id: id }
            })
        }

        deleteUser()
        .then(async () => {
            console.log("user deleted successfully")
            // await db.$disconnect()
        })
        .catch(async (e) => {
            console.error("The error: ",e)
            // await db.$disconnect()
            // console.log("error", e)
            return new Response("User deletion error", {status: 500})
        })
    }

    return new Response("Webhook received", {status: 200})
}
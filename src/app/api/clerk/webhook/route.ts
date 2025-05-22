// import { db } from "@/server/db"
import { PrismaClient } from '../../../../../generated/prisma/client'

const prisma = new PrismaClient()


export const POST = async (req: Request) => {
    const {data, type} = await req.json()
    console.log('clerk webhook type: ', type)
    console.log('clerk webhook data: ', data)

    if (type === "user.created") {
        const emailAddress = data.email_addresses[0].email_address
        const firstName = data.first_name
        const lastName = data.last_name
        const imageUrl = data.image_url
        const id = data.id

        async function createUser() {
            await prisma.user.create({
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
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error("The error: ",e)
            await prisma.$disconnect()
            // console.log("error", e)
            return new Response("User creation error", {status: 500})
        })
    }

    if (type === "user.updated") {
        const emailAddress = data.email_addresses[0].email_address
        const firstName = data.first_name
        const lastName = data.last_name
        const imageUrl = data.image_url
        const id = data.id

        async function updateUser() {
            await prisma.user.update({
                where: { id: id },
                data: {
                    emailAddress: emailAddress,
                    firstName: firstName,
                    lastName: lastName,
                    imageUrl: imageUrl
                }
            })
        }

        updateUser()
        .then(async () => {
            console.log("user updated successfully")
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error("The error: ", e)
            await prisma.$disconnect()
            // console.log("error", e)
            return new Response("User update error", {status: 500})
        })
    }

    if (type === "user.deleted") {
        const id = data.id

        async function deleteUser() {
            await prisma.user.delete({
                where: { id: id }
            })
        }

        deleteUser()
        .then(async () => {
            console.log("user deleted successfully")
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error("The error: ",e)
            await prisma.$disconnect()
            // console.log("error", e)
            return new Response("User deletion error", {status: 500})
        })
    }

    return new Response("Webhook received", {status: 200})
}
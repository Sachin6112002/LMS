import { Webhook } from "svix"
import User from '../models/User.js'

// API Controller Function to Manage Clerk User with database  
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    // Verify signature
    await whook.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    // Parse raw body to JSON
    const payload = JSON.parse(req.body)
    const { data, type } = payload

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }

        await User.create(userData)
        res.json({})
        break
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }

        const userExists = await User.findById(data.id)
        if (userExists) {
          await User.findByIdAndUpdate(data.id, userData)
        } else {
          console.log(`User not found during update: ${data.id}`)
        }

        res.json({})
        break
      }

      case 'user.deleted': {
        const userExists = await User.findById(data.id)
        if (userExists) {
          await User.findByIdAndDelete(data.id)
        } else {
          console.log(`User already deleted or missing: ${data.id}`)
        }

        res.json({})
        break
      }

      default:
        res.json({})
        break
    }
  } catch (error) {
    console.error("Webhook Error:", error.message)
    res.status(200).json({ success: false, message: error.message })
  }
}

const User = require('../models/User.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// register controller
const registerUser = async (req, res) => {
    try {
        //extract user info from req body
        const { username, email, password, role } = req.body

        //check if the user already exists in the db
        const checkExistingUser = await User.findOne({ $or: [{ username }, { email }] })
        if (checkExistingUser) {
            return res.status(400).json({
                success: false,
                message: `User already exists`
            })
        }

        //hash user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //create a new user and save in your db
        const newlyCreatedUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        })

        await newlyCreatedUser.save()

        if (newlyCreatedUser) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            })
        }
        else {
            res.status(400).json({
                success: false,
                message: 'Unable to register user'
            })
        }
    }

    catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'Some error occured'
        })
    }
}


//login controller

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body

        //find if the current user exists in the db or not
        const user = await User.findOne({ username })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: `User doesn't exist`
            })
        }

        //if the password is correct or not
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        //create user token
        const accessToken = jwt.sign({
            userId : user._id,
            username : user.username,
            role : user.role
        },process.env.JWT_SECRET_KEY,{
            expiresIn : '45m'
        })
        
        res.status(200).json({
            success:true,
            message: 'Logged in successful',
            accessToken
        })
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'Some error occured'
        })
    }
}

module.exports = {
    registerUser,
    loginUser
}
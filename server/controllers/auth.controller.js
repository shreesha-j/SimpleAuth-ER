import { User } from "../models/user.module";
import { generateTokenAndSetCookie } from "../utils/generateTokenansSetCookie";

export const signup = async (req, res) => {
    const { email, password, name } = req.body

    try{
        if(!email || !password || !name){
            return new Error('All fields are required')
        }

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:'user already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const VerificationCode = await generateVerificationToken();
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt : Date.now() + 24*60*60*1000,
        });

        await user.save();

        generateTokenAndSetCookie(res,user._id);

        await sendVerificationEmail(user.email,verificationToken);

        res.status(201).json({
            success:true,
            message:'user created successfully',
            user: {
                ...user._id,
                password: undefined
            }
        })
    }
    catch (error) {
        res.status(200).json({success:false ,message: `There is some error ${error.message}`})
    }
    
}

export const verifyEmail = async (req, res) => {
    const { verificationToken } = req.body;

    if (!verificationToken) {
        return res.status(400).json({ message: 'Verification token is required' });
    }

    try {
        const user = await User.findOne({ 
            verificationToken,
            verificationTokenExpiresAt : { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email,user.name,catrgory='Welcome');

        res.status(200).json({ success: true, message: 'Email verified successfully',user:{
            ...user._id,
            password: undefined
        } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const decode = await bcrypt.compare(password,user.password);

        if (!decode) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email' });
        }

        generateTokenAndSetCookie(res,user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({ success: true, message: 'Login successful',user: {
            ...user._id,
            password: undefined
        } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'logged out successfully' })
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try{
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const restToken = crypto.randomnBytes(20).toString('hex');
        user.resetPasswordToken = restToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        await sendPasswordResetEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: 'Password reset email sent' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (!token || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Token, password, and confirm password are required' });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        await sendPasswordResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: 'Password reset successful', user: {
            ...user._id,
            password: undefined
        }});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userDetails = User.findById(req.userId).select('-password');
        if (!userDetails.isVerified) {
            return res.status(401).json({ message: 'Please verify your email' });
        }


        res.status(200).json({ success: true, user: {
            ...userDetails._id,
            password: undefined
        }});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import * as bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

// Passport Local Strategy (for login)
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = findUser(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: 'Incorrect credentials.' });
    }
    return done(null, user);
  }
));

// Passport JWT Strategy (for protected routes)
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret' 
}, (jwtPayload, done) => {
  const user = findUser(jwtPayload.username);
  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
  }
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Only serialize the user ID
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id); // Replace with your logic to fetch the user
      done(null, user); 
    } catch (err) {
      done(err);
    }
  });


// Sample User model (adjust as needed)
interface User {
    id: number;
    username: string;
    password: string;
  }
  
  const users: User[] = [
    {
      id: 1,
      username: 'user1',
      password: bcrypt.hashSync('password1', 10)
    },
  ];
  
  // Find user function 
  const findUser = (username: string): User | undefined => {
    return users.find(user => user.username === username);
  };

export { passport, jsonwebtoken, findUser };
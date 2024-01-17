const passport = require('../utils/saml-config');
const loginDao = require('../DB/login-dao');
const fs = require('fs')
const SamlStrategy = require('passport-saml').Strategy;

jest.mock('../DB/login-dao', () => ({
    effectLogin: jest.fn(),
}));
jest.mock('passport-saml', () => {
    return {
      Strategy: jest.fn().mockImplementation((options, verify) => {
        return {
            name: 'mock-saml-strategy',
          options,
          verify,
        };
      }),
    };
});

describe('passport', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    const mockedUser = {id:'s200002'};
    const doneMock = jest.fn();


    it('should call passport.serializeUser without giving any error', () => {
        // Mock the done callback
        // Call the serializeUser function
        passport.serializeUser(mockedUser, doneMock);
        // Ensure that done was called once
        expect(doneMock).toHaveBeenCalledTimes(1);
    });
    it('should call passport.deserializeUser without giving any error', () => {
        // Mock the done callback
        passport.deserializeUser(mockedUser,doneMock);
        // Ensure that done was called once
        expect(doneMock).toHaveBeenCalledTimes(1);
    });
})
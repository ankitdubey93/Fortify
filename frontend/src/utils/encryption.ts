import * as argon2 from "argon2-browser";

export const derivedKey = async (password: string, salt: Uint8Array) => {
  const { hash } = await argon2.hash({
    pass: password,
    salt,
    type: argon2.ArgonType.Argon2id,
  });

  return hash;
};

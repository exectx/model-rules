import type { User } from "@clerk/react-router/ssr.server";
import type { useUser } from "@clerk/react-router";

export function getDisplayName(user: User) {
  if (user.username) return user.username;
  if (user.firstName && user.lastName)
    return `${user.firstName} ${user.lastName.at(0)}.`;
  if (user.firstName) return user.firstName;
  if (user.primaryEmailAddressId) {
    const emailObj = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    if (emailObj) {
      const atIndex = emailObj.emailAddress.lastIndexOf("@");
      if (atIndex > 0) {
        return emailObj.emailAddress.slice(0, atIndex);
      }
    }
  }
  return "user";
}

export function getDisplayNameFromClientResource(
  user: NonNullable<ReturnType<typeof useUser>["user"]>
) {
  if (user.username) return user.username;
  if (user.firstName && user.lastName)
    return `${user.firstName} ${user.lastName.at(0)}.`;
  if (user.firstName) return user.firstName;
  if (user.primaryEmailAddressId) {
    const emailObj = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );
    if (emailObj) {
      const atIndex = emailObj.emailAddress.lastIndexOf("@");
      if (atIndex > 0) {
        return emailObj.emailAddress.slice(0, atIndex);
      }
    }
  }
  return "user";
}

export function getUserShapeFromClient(
  user: ReturnType<typeof useUser>["user"]
) {
  if (!user) {
    return {
      avatar: "",
      email: "",
      name: "",
    };
  }
  return {
    avatar: user.imageUrl,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    name: getDisplayNameFromClientResource(user),
  };
}

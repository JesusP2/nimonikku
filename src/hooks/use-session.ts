import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useSession = () =>
  useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      let jwt = null;
      const session = await authClient.getSession({
        fetchOptions: {
          onSuccess: (ctx) => {
            jwt = ctx.response.headers.get("set-auth-jwt");
          },
        },
      });
      return {
        ...session.data,
        jwt,
      };
    },
  });

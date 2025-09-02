import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useUser = () => useSuspenseQuery(useUserQueryOptions());
export const useUserQueryOptions = () =>
  queryOptions({
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
      if (!session.data?.session) {
        const { data: anonymousData } = await authClient.signIn.anonymous();
        if (!anonymousData?.user) {
          throw new Error("Failed to get user");
        }
        return {
          ...anonymousData?.user,
          jwt: null,
        };
      }
      return {
        ...session.data.user,
        jwt,
      };
    },
  });

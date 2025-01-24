import me, { myEvents } from "@/actions/users/me";
import { ThemeToggle } from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/ui/eventCard";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { deleteToken } from "@/lib/storage";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, View } from "react-native";
import Toast from "react-native-toast-message";
import { Event, Group } from "@/actions/types";
import { DoorOpenIcon, QrCodeIcon, SettingsIcon } from "lucide-react-native";

export default function Profil() {
  const { setAuthState } = useAuth();
  const router = useRouter();

  const user = useQuery({
    queryKey: ["users", "me"],
    queryFn: me,
  });

  const userEvents = useQuery({
    queryKey: ["users", "me", "events"],
    queryFn: myEvents,
  });

  const getStudyYearAsClass = (studyYear: Group, study: Group): string => {
    const studyyear = Number(studyYear.name);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const diff = currentYear - studyyear + (currentMonth > 7 ? 1 : 0);
    if (diff <= 3) {
      if (study.slug === "digital-samhandling") {
        return `${diff + 3}. klasse.`;
      }

      return `${diff}. klasse`;
    }

    return `Startet i ${studyyear}`;
  };

  const onLogout = async () => {
    const isLoggedOut = await deleteToken();

    if (!isLoggedOut) {
      return Toast.show({
        type: "error",
        text1: "Feil",
        text2: "Kunne ikke logge ut. Prøv igjen.",
      });
    }

    setAuthState!({
      auhtenticated: false,
      isLoading: false,
      token: null,
    });

    router.replace("/(auth)/login");
  };

  if (user.isPending) {
    return (
      <PageWrapper
        className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10"
        refreshQueryKey={["users", "me"]}
      >
        <Text className="text-lg">Laster profil...</Text>
      </PageWrapper>
    );
  }

  if (user.isError) {
    return (
      <PageWrapper
        className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10"
        refreshQueryKey={["users", "me"]}
      >
        <Text className="text-lg text-red-500">Feil: {user.error.message}</Text>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper refreshQueryKey={["users", "me"]}>
      <View className="flex flex-col gap-4 p-4">
        <Text className="text-2xl font-semibold m-auto my-2">Profil</Text>
        {user.data.image && (
          <Image
            className="w-24 h-24 rounded-full"
            source={{ uri: user.data.image }}
          />
        )}
        <View className="mt-2">
          <Text className="text-2xl font-semibold">
            {user.data.first_name} {user.data.last_name}
          </Text>
          <Text className="text-lg text-muted-foreground">
            @{user.data.user_id}
          </Text>
          <Text className="text-lg">
            {getStudyYearAsClass(
              user.data.studyyear.group,
              user.data.study.group
            )}{" "}
            - {user.data.study.group.name}
          </Text>
          <Text className="text-lg">{user.data.email}</Text>
        </View>
        <View className="flex flex-row gap-4 w-full h-20">
          <Button
            className="bg-transparent flex-1 min-h-full border border-blue-500"
            variant="default"
            onPress={() => {
              router.back();
              router.push("/profil/qrmodal");
            }}
          >
            <Text>
              <QrCodeIcon />
            </Text>
          </Button>

          <ThemeToggle className="bg-transparent flex-1 min-h-full border border-blue-500 text-blue-500" />

          <Button
            className="bg-transparent flex-1 min-h-full border border-blue-500"
            variant="default"
          >
            <Text>
              <SettingsIcon />
            </Text>
          </Button>

          <Button
            className="bg-transparent flex-1 min-h-full border border-red-400"
            variant="destructive"
            onPress={onLogout}
          >
            <Text>
              <DoorOpenIcon />
            </Text>
          </Button>
        </View>
        <Text className="text-2xl mt-4 font-semibold">Dine arrangementer</Text>
        <DisplayUserEvents userEvents={userEvents} />
      </View>
    </PageWrapper>
  );
}

function DisplayUserEvents({
  userEvents,
}: {
  userEvents: UseQueryResult<{ results: Event[] }, Error>;
}) {
  const router = useRouter();

  if (userEvents.isPending) {
    return <Text>Loading...</Text>;
  }

  if (userEvents.isError) {
    return <Text>Error: {userEvents.error.message}</Text>;
  }

  if (userEvents.data.results.length === 0) {
    return <Text>Du er ikke påmeldt noen arrangementer.</Text>;
  }

  return userEvents.data.results.map((event) => (
    <EventCard
      key={event.id}
      id={event.id.toString()}
      title={event.title}
      date={new Date(event.start_date)}
      image={event.image ?? null}
      onPress={() => {
        router.back();
        router.push({
          pathname: `/profil/eventmodal`,
          params: {
            arrangementId: event.id,
          },
        });
      }}
    />
  ));
}

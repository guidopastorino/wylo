import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { signOut, useSession } from "@/lib/auth-client";

export default function HomeScreen() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.replace("/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f8fafc" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sesiones activas</Text>
          <Text style={styles.subtitle}>
            Vista rápida de tu sesión actual en Wylo.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>ESTADO DE SESIÓN</Text>

          {error && !isPending && (
            <Text style={styles.errorText}>
              Hubo un problema al obtener la sesión.
            </Text>
          )}

          {!isPending && !session && !error && (
            <Text style={styles.infoText}>No hay ninguna sesión activa.</Text>
          )}

          {session && (
            <View style={styles.sessionInfo}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {session.user?.name ?? "Usuario sin nombre"}
                </Text>
                <Text style={styles.userEmail}>{session.user?.email}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed,
                  isLoggingOut && styles.logoutButtonDisabled,
                ]}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.logoutButtonText}>
                  {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {session && (
          <View style={styles.debugCard}>
            <Text style={styles.debugLabel}>DATOS DE LA SESIÓN (DEBUG)</Text>
            <ScrollView horizontal style={styles.debugScroll}>
              <Text style={styles.debugText}>
                {JSON.stringify(session, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#0f172a",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 20,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#94a3b8",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#f87171",
  },
  infoText: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  sessionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f1f5f9",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#94a3b8",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutButtonPressed: {
    backgroundColor: "#f8fafc",
    borderColor: "#f8fafc",
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#f1f5f9",
  },
  debugCard: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
    padding: 16,
  },
  debugLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
    color: "#94a3b8",
    marginBottom: 8,
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugText: {
    fontSize: 11,
    color: "#e2e8f0",
    fontFamily: "monospace",
  },
});

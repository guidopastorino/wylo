import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";

type Tab = "signin" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signIn.email({
      email: signInEmail,
      password: signInPassword,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Error al iniciar sesión");
      return;
    }
    router.replace("/");
  };

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signUp.email({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Error al registrarse");
      return;
    }
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.logo}>Wylo</Text>

            <View style={styles.tabContainer}>
              <Pressable
                style={[styles.tab, tab === "signin" && styles.tabActive]}
                onPress={() => {
                  setTab("signin");
                  setError(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === "signin" && styles.tabTextActive,
                  ]}
                >
                  Iniciar sesión
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, tab === "signup" && styles.tabActive]}
                onPress={() => {
                  setTab("signup");
                  setError(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab === "signup" && styles.tabTextActive,
                  ]}
                >
                  Registrarse
                </Text>
              </Pressable>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {tab === "signin" ? (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor="#64748b"
                    value={signInEmail}
                    onChangeText={setSignInEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#64748b"
                    value={signInPassword}
                    onChangeText={setSignInPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0f172a" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre"
                    placeholderTextColor="#64748b"
                    value={signUpName}
                    onChangeText={setSignUpName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor="#64748b"
                    value={signUpEmail}
                    onChangeText={setSignUpEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor="#64748b"
                    value={signUpPassword}
                    onChangeText={setSignUpPassword}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0f172a" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Crear cuenta</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
    backgroundColor: "#0f172a",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: "600",
    color: "#f8fafc",
    textAlign: "center",
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#334155",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#475569",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
  },
  tabTextActive: {
    color: "#f8fafc",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#f87171",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#cbd5e1",
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#f8fafc",
  },
  button: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: {
    backgroundColor: "#e2e8f0",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
});

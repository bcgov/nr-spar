package ca.bc.gov.backendstartapi.config;

import static org.springframework.aot.hint.MemberCategory.DECLARED_FIELDS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_CONSTRUCTORS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_PUBLIC_METHODS;

import java.util.stream.Stream;
import org.hibernate.dialect.PostgreSQLDialect;
import org.hibernate.dialect.PostgreSQLInetJdbcType;
import org.hibernate.dialect.PostgreSQLIntervalSecondJdbcType;
import org.hibernate.dialect.PostgreSQLJsonPGObjectJsonbType;
import org.hibernate.dialect.PostgreSQLStructPGObjectJdbcType;
import org.hibernate.event.spi.EventType;
import org.postgresql.Driver;
import org.postgresql.core.QueryExecutorCloseAction;
import org.postgresql.hostchooser.HostRequirement;
import org.postgresql.jdbc.AutoSave;
import org.postgresql.jdbc.PgStatement;
import org.postgresql.shaded.com.ongres.stringprep.Option;
import org.postgresql.util.PGobject;
import org.springframework.aot.hint.ReflectionHints;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.TypeReference;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

/**
 * Native-image hints for Hibernate and the PostgreSQL driver that Spring's AOT processing does not
 * cover. Recorded with the native-image tracing agent (see
 * {@code NativeImageFlowsIntegrationTest}), then written as hints.
 */
public class HibernatePostgresRuntimeHints implements RuntimeHintsRegistrar {

  @Override
  public void registerHints(@NonNull RuntimeHints hints, @Nullable ClassLoader classLoader) {
    registerHibernate(hints.reflection());
    registerPostgres(hints.reflection());
  }

  private static void registerHibernate(ReflectionHints reflection) {
    // Hibernate builds an array of listeners for every event type reflectively and reads
    // EventType's constants by field.
    reflection.registerType(EventType.class, DECLARED_FIELDS);
    EventType.values()
        .forEach(type -> reflection.registerType(type.baseListenerInterface().arrayType()));

    Stream.of(
            PostgreSQLDialect.class,
            PostgreSQLInetJdbcType.class,
            PostgreSQLIntervalSecondJdbcType.class,
            PostgreSQLJsonPGObjectJsonbType.class,
            PostgreSQLStructPGObjectJdbcType.class)
        .forEach(type -> reflection.registerType(type, INVOKE_DECLARED_CONSTRUCTORS));
  }

  private static void registerPostgres(ReflectionHints reflection) {
    reflection.registerType(Driver.class, INVOKE_DECLARED_CONSTRUCTORS);
    reflection.registerType(PGobject.class);

    // Fields updated through AtomicReferenceFieldUpdater.
    reflection.registerType(QueryExecutorCloseAction.class, DECLARED_FIELDS);
    reflection.registerType(PgStatement.class, DECLARED_FIELDS);

    // Enums whose values() the driver calls reflectively.
    Stream.of(HostRequirement.class, AutoSave.class, Option.class)
        .forEach(type -> reflection.registerType(type, INVOKE_PUBLIC_METHODS));
    reflection.registerType(
        TypeReference.of("org.postgresql.jdbc.PgConnection$ReadOnlyBehavior"),
        INVOKE_PUBLIC_METHODS);
  }
}

package ca.bc.gov.oracleapi.util;

import ca.bc.gov.oracleapi.exception.ModelMapperRunTimeException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Objects;
import java.util.stream.Stream;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * A Class that provides a util function to convert an Object of one class to another. E.g. Entity
 * to Dto.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ModelMapper {

  /**
   * This method convert an object to a class specified in the param.
   *
   * @param fromObj The Object to be converted
   * @param toClass The class of the converted object
   * @return An object that is the class of toClass
   */
  public static <T> T convert(@NonNull Object fromObj, Class<T> toClass) {
    try {
      Constructor<T> constructor = toClass.getConstructor();
      T instance = constructor.newInstance();

      // Looks for same properties
      Field[] fields = fromObj.getClass().getDeclaredFields();

      for (Field field : fields) {
        String fieldToSearch =
            field.getName().substring(0, 1).toUpperCase() + field.getName().substring(1);
        // Try to find a get method
        Method getMethodInstane = findGetMethod(fromObj, fieldToSearch);

        if (getMethodInstane == null) {
          continue;
        }

        // Get the value
        Object value = getMethodInstane.invoke(fromObj);
        if (Objects.isNull(value)) {
          continue;
        }

        // Try to find a set method
        Method setMethodInstance = findSetMethod(fieldToSearch, instance);

        if (setMethodInstance == null) {
          continue;
        }

        // Set the value
        setMethodInstance.invoke(instance, value);
      }

      return instance;
    } catch (Exception e) {
      throw new ModelMapperRunTimeException(toClass.getName(), e.getMessage());
    }
  }

  private static Method findGetMethod(@NonNull Object fromObj, String fieldToSearch) {
    String getMethod = String.format("get%s", fieldToSearch);
    return Stream.of(fromObj.getClass().getMethods())
        .filter(x -> x.getName().equals(getMethod))
        .findFirst()
        .orElse(null);
  }

  private static <T> Method findSetMethod(String fieldToSearch, T instance) {
    String setMethod = String.format("set%s", fieldToSearch);
    return Stream.of(instance.getClass().getMethods())
        .filter(x -> x.getName().equals(setMethod))
        .findFirst()
        .orElse(null);
  }
}

-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 20-05-2025 a las 11:16:11
-- Versión del servidor: 8.0.42-0ubuntu0.20.04.1
-- Versión de PHP: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `invtrack`
--

-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `invtrack`;

--

-- Seleccionar la base de datos
USE `invtrack`;
--
-- Estructura de tabla para la tabla `assets`
--

CREATE TABLE `assets` (
  `id` bigint NOT NULL,
  `model` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `serial_number` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `state_asset` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL,
  `observation` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `modified_at` datetime(6) NOT NULL,
  `fk_brand_id` bigint NOT NULL,
  `fk_category_id` bigint NOT NULL,
  `modified_by_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_auditlog`
--

CREATE TABLE `audit_auditlog` (
  `id` bigint NOT NULL,
  `action` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `model_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `object_id` int UNSIGNED NOT NULL,
  `description` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` datetime(6) NOT NULL,
  `user_id` int DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `audit_auditlog`
--

INSERT INTO `audit_auditlog` (`id`, `action`, `username`, `model_name`, `object_id`, `description`, `timestamp`, `user_id`) VALUES
(1, 'update', 'almacentecnologia', 'User', 1, 'Respuesta de seguridad fue actualizada', '2025-05-12 14:57:10.057677', 1),
(2, 'update', 'almacentecnologia', 'Profile', 1, 'Respuesta de seguridad fue actualizada', '2025-05-12 14:57:10.062506', 1),
(3, 'create', 'almacentecnologia', 'Category', 1, 'Categoría creada: Monitor (ID: 1)', '2025-05-16 12:54:43.897057', 1),
(4, 'update', 'almacentecnologia', 'Category', 1, 'Categoría actualizada (ID: 1): Nombre: \'Monitor\' cambio a \'Torre PC\'', '2025-05-16 12:54:55.549735', 1),
(5, 'create', 'almacentecnologia', 'Brand', 1, 'Marca creada: HP', '2025-05-16 12:55:02.712454', 1),
(6, 'update', 'almacentecnologia', 'Brand', 1, 'Marca editada: Dell', '2025-05-16 12:55:09.931961', 1),
(7, 'Delete', 'almacentecnologia', 'FileBackup', 0, 'Respaldo eliminado: backup_20250430_171050.enc (Tamaño: 337.30 KB, Ruta: /var/www/invtrack/Assets_System/app/backups/backup_20250430_171050.enc)', '2025-05-16 14:30:36.151219', 1),
(8, 'Delete', 'almacentecnologia', 'FileBackup', 0, 'Respaldo eliminado: backup_20250430_171050.enc (Tamaño: 337.30 KB, Ruta: /var/www/invtrack/Assets_System/app/backups/backup_20250430_171050.enc)', '2025-05-16 14:31:48.960408', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add Bien', 7, 'add_asset'),
(26, 'Can change Bien', 7, 'change_asset'),
(27, 'Can delete Bien', 7, 'delete_asset'),
(28, 'Can view Bien', 7, 'view_asset'),
(29, 'Can add Categoria', 8, 'add_category'),
(30, 'Can change Categoria', 8, 'change_category'),
(31, 'Can delete Categoria', 8, 'delete_category'),
(32, 'Can view Categoria', 8, 'view_category'),
(33, 'Can add Marca', 9, 'add_brand'),
(34, 'Can change Marca', 9, 'change_brand'),
(35, 'Can delete Marca', 9, 'delete_brand'),
(36, 'Can view Marca', 9, 'view_brand'),
(37, 'Can add profile', 10, 'add_profile'),
(38, 'Can change profile', 10, 'change_profile'),
(39, 'Can delete profile', 10, 'delete_profile'),
(40, 'Can view profile', 10, 'view_profile'),
(41, 'Can add audit log', 11, 'add_auditlog'),
(42, 'Can change audit log', 11, 'change_auditlog'),
(43, 'Can delete audit log', 11, 'delete_auditlog'),
(44, 'Can view audit log', 11, 'view_auditlog');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int NOT NULL,
  `password` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_general_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$600000$vTBcL8FoZGGWYuY6fgtXto$mnoPwZIrYRmU0hxjd2xx8uX5zmswmZatZzWRTULLoBs=', '2025-05-20 14:09:54.798586', 1, 'almacentecnologia', 'Almacén', 'Tecnología', 'almacentecnologia@gmail.com', 1, 1, '2025-05-12 14:40:40.386390');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `brands`
--

CREATE TABLE `brands` (
  `id` bigint NOT NULL,
  `name` varchar(35) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `modified_at` datetime(6) NOT NULL,
  `modified_by_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `brands`
--

INSERT INTO `brands` (`id`, `name`, `created_at`, `modified_at`, `modified_by_id`) VALUES
(1, 'Dell', '2025-05-16 12:55:02.653668', '2025-05-16 12:55:09.872174', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` bigint NOT NULL,
  `name` varchar(35) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `modified_at` datetime(6) NOT NULL,
  `modified_by_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`, `modified_at`, `modified_by_id`) VALUES
(1, 'Torre PC', '2025-05-16 12:54:43.828361', '2025-05-16 12:54:55.494739', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_general_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int NOT NULL,
  `app_label` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(11, 'audit', 'auditlog'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'auth', 'user'),
(9, 'brand', 'brand'),
(8, 'category', 'category'),
(5, 'contenttypes', 'contenttype'),
(7, 'inventory', 'asset'),
(6, 'sessions', 'session'),
(10, 'users', 'profile');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL,
  `app` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-05-12 14:40:10.597766'),
(2, 'auth', '0001_initial', '2025-05-12 14:40:11.035037'),
(3, 'admin', '0001_initial', '2025-05-12 14:40:11.134683'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-05-12 14:40:11.149921'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-05-12 14:40:11.164859'),
(6, 'audit', '0001_initial', '2025-05-12 14:40:11.235344'),
(7, 'contenttypes', '0002_remove_content_type_name', '2025-05-12 14:40:11.313557'),
(8, 'auth', '0002_alter_permission_name_max_length', '2025-05-12 14:40:11.377527'),
(9, 'auth', '0003_alter_user_email_max_length', '2025-05-12 14:40:11.434661'),
(10, 'auth', '0004_alter_user_username_opts', '2025-05-12 14:40:11.456530'),
(11, 'auth', '0005_alter_user_last_login_null', '2025-05-12 14:40:11.511296'),
(12, 'auth', '0006_require_contenttypes_0002', '2025-05-12 14:40:11.515343'),
(13, 'auth', '0007_alter_validators_add_error_messages', '2025-05-12 14:40:11.537933'),
(14, 'auth', '0008_alter_user_username_max_length', '2025-05-12 14:40:11.592026'),
(15, 'auth', '0009_alter_user_last_name_max_length', '2025-05-12 14:40:11.618814'),
(16, 'auth', '0010_alter_group_name_max_length', '2025-05-12 14:40:11.654896'),
(17, 'auth', '0011_update_proxy_permissions', '2025-05-12 14:40:11.675604'),
(18, 'auth', '0012_alter_user_first_name_max_length', '2025-05-12 14:40:11.716888'),
(19, 'brand', '0001_initial', '2025-05-12 14:40:11.782685'),
(20, 'category', '0001_initial', '2025-05-12 14:40:11.867381'),
(21, 'inventory', '0001_initial', '2025-05-12 14:40:12.009625'),
(22, 'sessions', '0001_initial', '2025-05-12 14:40:12.067603'),
(23, 'users', '0001_initial', '2025-05-12 14:40:12.122138');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('dewzbbyjszlmd6uhcaecbwlq4dsxhxq9', '.eJxVjEEOwiAURO_C2hB-C_3QpXvPQKB8LWrBFLoy3t2SdKG7ybx582bWbXW2W6HVxsBGBuz023k3PSg1EO4u3TKfcqpr9LxN-EELv-RAz_Ox_TuYXZmb7Y2Rk_QgNSJ5cyVhnAZlyEgHwSkQIKSQQXUAcs8KiXrRo4GgsdPttFApMScbU6y2xoVKdcvLshFQIiqxq3zYU6eGzxcNmETZ:1uHNkX:3o-l8sFZaNUrwZ1uOLJM85q3S7ejoaecM8BzUjiOZR0', '2025-06-03 14:15:21.730364'),
('zz4vvo7a7ejc3p0albxv7641zwlp430o', '.eJxVjMEOwiAQRP-FsyG77RKgR-9-A4GyWtSCKfRk_HfbpJfeJvPezFe4yrWmkl3KqbmWZq7Nzx8nBtSkCQCNlrBFpO4inF_b5NbKi0tRDALFqQt-fHHeQXz6_ChyLLktKchdkQet8lYiv6-HezqYfJ32dbCWRgpIRmsO9s5gvUFl2ZLH6BUCAgFF1SHSlpVm7qHXFqPRnRG_P-ioRM0:1uFubz:57BV1JflUZ1s70o2jOinTsrTR1gZX4rCjmuL9tLMjBk', '2025-05-30 12:56:27.169726');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users_profile`
--

CREATE TABLE `users_profile` (
  `id` bigint NOT NULL,
  `security_question` int NOT NULL,
  `security_answer` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users_profile`
--

INSERT INTO `users_profile` (`id`, `security_question`, `security_answer`, `user_id`) VALUES
(2, 2, 'pbkdf2_sha256$1000000$FYgoFx2m8YVmrMJDuTgrqE$qwyg+EMBQUmMrxmiE4Lsp15+9+MMM2yBdXml8Xh6zXo=', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_number` (`serial_number`),
  ADD UNIQUE KEY `state_asset` (`state_asset`),
  ADD KEY `Assets_fk_brand_id_c6ed5070_fk_Brands_id` (`fk_brand_id`),
  ADD KEY `Assets_fk_category_id_781ae49d_fk_Categories_id` (`fk_category_id`),
  ADD KEY `Assets_modified_by_id_30cf3dcf_fk_auth_user_id` (`modified_by_id`);

--
-- Indices de la tabla `audit_auditlog`
--
ALTER TABLE `audit_auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_auditlog_user_id_c1cca96c_fk_auth_user_id` (`user_id`);

--
-- Indices de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indices de la tabla `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indices de la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Brands_modified_by_id_9dee0952_fk_auth_user_id` (`modified_by_id`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Categories_modified_by_id_37db2c94_fk_auth_user_id` (`modified_by_id`);

--
-- Indices de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indices de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indices de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indices de la tabla `users_profile`
--
ALTER TABLE `users_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audit_auditlog`
--
ALTER TABLE `audit_auditlog`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `users_profile`
--
ALTER TABLE `users_profile`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `Assets_fk_brand_id_c6ed5070_fk_Brands_id` FOREIGN KEY (`fk_brand_id`) REFERENCES `brands` (`id`),
  ADD CONSTRAINT `Assets_fk_category_id_781ae49d_fk_Categories_id` FOREIGN KEY (`fk_category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `Assets_modified_by_id_30cf3dcf_fk_auth_user_id` FOREIGN KEY (`modified_by_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `audit_auditlog`
--
ALTER TABLE `audit_auditlog`
  ADD CONSTRAINT `audit_auditlog_user_id_c1cca96c_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `brands`
--
ALTER TABLE `brands`
  ADD CONSTRAINT `Brands_modified_by_id_9dee0952_fk_auth_user_id` FOREIGN KEY (`modified_by_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `Categories_modified_by_id_37db2c94_fk_auth_user_id` FOREIGN KEY (`modified_by_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `users_profile`
--
ALTER TABLE `users_profile`
  ADD CONSTRAINT `users_profile_user_id_2112e78d_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

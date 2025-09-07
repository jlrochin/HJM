--
-- PostgreSQL database dump
--

\restrict wfHTPSSfcVZu9trDvZDbFC0f7kacGNgTeSeZDCclvRsZ0arH7GVMjJKVTCrz6Nb

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

-- Started on 2025-09-01 06:45:10 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3452 (class 0 OID 16510)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
7c25e998-102c-4b72-8880-79b026c1b13a	73cd7d025cb5f5ad35469f5e1803672e8ee0cfd30ec3b1644b94c26b69f4e29c	2025-08-30 21:21:52.698546+00	20250627161716_add_user_change_history	\N	\N	2025-08-30 21:21:52.684993+00	1
d5cc486f-678a-4791-a1aa-29db5f28e7d3	f2bd6f896ec3f747466cd8f7a2982235066f4edf4646332294f4db6d7ff4200e	2025-08-30 21:21:52.700568+00	20250627170326_add_user_relations_to_history	\N	\N	2025-08-30 21:21:52.698777+00	1
9c2e963c-f9ca-4039-be06-55110783365f	12ce4560d8ac906239ed55baa910a282e9bb75ed70ef883f4d6ea0656d8e9075	2025-08-30 21:21:52.704172+00	20250627172537_add_audit_log	\N	\N	2025-08-30 21:21:52.700802+00	1
14ffa283-0210-4c77-aa8d-99f23bc38d7c	5e08d459ee93d80b0f94ab666a97aec59ce126fdf6c9e08a9cf018b4fb34da85	2025-08-30 21:21:52.705231+00	20250628014313_add_is_invisible_to_user	\N	\N	2025-08-30 21:21:52.704361+00	1
80967a91-5195-4fdc-a9a0-347a4f04d70d	9cdf3ce30903cfa4de6dc73c7916d195bb2cc3b215a2583508a11aba4417a89e	2025-08-30 21:21:52.706313+00	20250628022132_add_last_active_at_to_user	\N	\N	2025-08-30 21:21:52.705426+00	1
a9fcbf64-b66e-4d91-b727-f1bad1e6263e	5e08d459ee93d80b0f94ab666a97aec59ce126fdf6c9e08a9cf018b4fb34da85	2025-08-30 21:21:52.707443+00	20250628022549_restore_is_invisible	\N	\N	2025-08-30 21:21:52.70651+00	1
cc4df60e-c589-493e-bdb9-6967b8f02d1f	f2b21611f5eeb1c310b127fdcb5ff0a11f6cbc35ab5d808e1af879f407681222	2025-08-30 21:21:52.708425+00	20250829014606_add_display_order_to_directions	\N	\N	2025-08-30 21:21:52.707629+00	1
0384f264-7241-46db-84eb-658697d7b834	c1ca652bb452c469f22f6ac179727b53aae64aeb53203f7f5c14111938c8ec99	\N	20250829032215_add_user_service_relation	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250829032215_add_user_service_relation\n\nDatabase error code: 42704\n\nDatabase error:\nERROR: constraint "users_service_id_fkey" of relation "users" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42704), message: "constraint \\"users_service_id_fkey\\" of relation \\"users\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(12250), routine: Some("ATExecDropConstraint") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250829032215_add_user_service_relation"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250829032215_add_user_service_relation"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	\N	2025-08-30 21:21:52.708606+00	0
0d25f4a5-27f2-467d-8051-769b44a2aebe	73cd7d025cb5f5ad35469f5e1803672e8ee0cfd30ec3b1644b94c26b69f4e29c	2025-08-29 01:46:06.04331+00	20250627161716_add_user_change_history	\N	\N	2025-08-29 01:46:06.021341+00	1
fa91a5e4-3bfb-449d-b440-941f4e6f7c96	f2bd6f896ec3f747466cd8f7a2982235066f4edf4646332294f4db6d7ff4200e	2025-08-29 01:46:06.045498+00	20250627170326_add_user_relations_to_history	\N	\N	2025-08-29 01:46:06.04392+00	1
0999d39e-01b8-4087-bb85-6a20290a4049	12ce4560d8ac906239ed55baa910a282e9bb75ed70ef883f4d6ea0656d8e9075	2025-08-29 01:46:06.048751+00	20250627172537_add_audit_log	\N	\N	2025-08-29 01:46:06.046001+00	1
ff1f92f2-4470-4fcd-862a-16d5981c1213	5e08d459ee93d80b0f94ab666a97aec59ce126fdf6c9e08a9cf018b4fb34da85	2025-08-29 01:46:06.052217+00	20250628014313_add_is_invisible_to_user	\N	\N	2025-08-29 01:46:06.049473+00	1
22f4c503-f671-43ce-b1e0-5b9d6c0f2ce3	9cdf3ce30903cfa4de6dc73c7916d195bb2cc3b215a2583508a11aba4417a89e	2025-08-29 01:46:06.055824+00	20250628022132_add_last_active_at_to_user	\N	\N	2025-08-29 01:46:06.052626+00	1
7c300676-1fa5-429d-8374-39fe9d129cfe	5e08d459ee93d80b0f94ab666a97aec59ce126fdf6c9e08a9cf018b4fb34da85	2025-08-29 01:46:06.057333+00	20250628022549_restore_is_invisible	\N	\N	2025-08-29 01:46:06.056233+00	1
715aecc5-b1ae-4fde-90b1-ec928aff510a	f2b21611f5eeb1c310b127fdcb5ff0a11f6cbc35ab5d808e1af879f407681222	2025-08-29 01:46:06.361306+00	20250829014606_add_display_order_to_directions	\N	\N	2025-08-29 01:46:06.360319+00	1
09808d96-9416-4d59-bfe5-3fcfaaef9191	a55d68f0226423552d6ef3dc905811208ff028348316833b4670976250a4fd07	2025-08-29 03:13:05.387443+00	20250829031305_add_user_service_relation	\N	\N	2025-08-29 03:13:05.385553+00	1
69f5d5eb-f896-4fd2-ba20-bf5ee8caf246	c1ca652bb452c469f22f6ac179727b53aae64aeb53203f7f5c14111938c8ec99	2025-08-29 03:22:15.928329+00	20250829032215_add_user_service_relation	\N	\N	2025-08-29 03:22:15.926924+00	1
\.


--
-- TOC entry 3454 (class 0 OID 16520)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public.users (id, username, email, password_hash, role, first_name, last_name, department, phone, is_active, created_at, updated_at, last_active_at, is_invisible, service_id) FROM stdin;
26	subdireccin-de-recur-1	subdireccin-de-recur-1@cagpu.com	$2a$10$/JHbAzKBiEHSlk/CTtQtnec0R.j/0/cEwF.9OdZuu3eyGmNBSOmuy	service_user	Subdirección de Recursos Materiales y Servicios	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.651	2025-08-29 03:13:37.651	\N	f	SUBDIRECCION_RECURSOS_MATERIALES_SERVICIOS
3	unidad-de-comunicaci	unidad-de-comunicaci@cagpu.com	$2a$10$4mYjrqdGCKP4OPOvc.KhkeYAywvtVwkJyJ8lJUF1VaHZ10CF.64BK	service_user	Unidad de Comunicación Social	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.332	2025-08-29 03:13:36.332	\N	f	UNIDAD_COMUNICACION_SOCIAL
4	subdireccin-de-ensea	subdireccin-de-ensea@cagpu.com	$2a$10$E.N0DYxlUii9ID8Ro0pD..zIumbtcfyLGNqvRHjTOgRfpRXbXizHe	service_user	Subdirección de Enseñanza	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.39	2025-08-29 03:13:36.39	\N	f	SUBDIRECCION_ENSENANZA
6	posgrado	posgrado@cagpu.com	$2a$10$/5jAvovPKV0goF98mzzn8uCq8aW1Oklso3bMNtptVZeQe39uDJUcm	service_user	Posgrado	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.505	2025-08-29 03:13:36.505	\N	f	POSGRADO
7	extensin-continua	extensin-continua@cagpu.com	$2a$10$5/LkQEAl6l.dhz9NEMjqKOHhmai4JFW0OWAI59XuMmbAzu2mbmZNa	service_user	Extensión Continua	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.562	2025-08-29 03:13:36.562	\N	f	EXTENSION_CONTINUA
8	divisin-de-investiga	divisin-de-investiga@cagpu.com	$2a$10$k72UZTH3ZqP4/SyT/LAvFO7fVCVRVDcHb2dbQ8QZz.FL0SaoUZovm	service_user	División de Investigación	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.619	2025-08-29 03:13:36.619	\N	f	DIVISION_INVESTIGACION
9	desarrollo-cientfico	desarrollo-cientfico@cagpu.com	$2a$10$5/gXhI6styKHv2PxKBqk6Om2oAUvq2odzL/8M12R7FnCkCIEf05eS	service_user	Desarrollo Científico y Tecnológico	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.676	2025-08-29 03:13:36.676	\N	f	DESARROLLO_CIENTIFICO_TECNOLOGICO
10	unidad-de-transparen	unidad-de-transparen@cagpu.com	$2a$10$XQ3fFyR8uo0JeRMrq8U8pe.YD6t2bDNepwUzV.2bqdoGN/7NbvmbO	service_user	Unidad de Transparencia	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:36.734	2025-08-29 03:13:36.734	\N	f	UNIDAD_TRANSPARENCIA
11	divisin-de-calidad-d	divisin-de-calidad-d@cagpu.com	$2a$10$oadxVFWcmB7lNe2uIqk7ju9USFFit2P.YiYqEmNzRc0ZHA6/Q7S.a	service_user	División de Calidad de la Atención	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:36.791	2025-08-29 03:13:36.791	\N	f	DIVISION_CALIDAD_ATENCION
12	farmacia-hospitalari	farmacia-hospitalari@cagpu.com	$2a$10$8lmzmF/KpMqt8iDAMF258e8Jb76IPGIicVSVhj42Rrg33UELWOM4e	service_user	Farmacia Hospitalaria	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:36.849	2025-08-29 03:13:36.849	\N	f	FARMACIA_HOSPITALARIA
13	farmacovigilancia	farmacovigilancia@cagpu.com	$2a$10$RR1NwLEhErBATsk49mS/C.rLWDkWbBjUWSNXF/kxwL1Y2gKrQseqS	service_user	Farmacovigilancia	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:36.906	2025-08-29 03:13:36.906	\N	f	FARMACOVIGILANCIA
14	centro-de-mezclas-in	centro-de-mezclas-in@cagpu.com	$2a$10$PdSPsGBLb..YKUiX68Xpv.x05BhF6inI//imuD26OWKBpe5Hv3hky	service_user	Centro de Mezclas Institucional	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:36.963	2025-08-29 03:13:36.963	\N	f	CENTRO_MEZCLAS_INSTITUCIONAL
15	divisin-de-vinculaci	divisin-de-vinculaci@cagpu.com	$2a$10$mnpxXXCjiCJyY6ze5U08R.Lqn0M7EekCmNPtmgyaoq8UuvtdPnqS2	service_user	División de Vinculación y Seguimiento Clínico	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:37.021	2025-08-29 03:13:37.021	\N	f	DIVISION_VINCULACION_SEGUIMIENTO_CLINICO
16	anlisis-de-procesos-	anlisis-de-procesos-@cagpu.com	$2a$10$lHUPY61NM4dz2s0ULjH/z.6RH80EO9lIvAd4ly6JiE51lPJeFXjVi	service_user	Análisis de Procesos y Mejora Continua	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:37.078	2025-08-29 03:13:37.078	\N	f	ANALISIS_PROCESOS_MEJORA_CONTINUA
17	evaluacin-del-desemp	evaluacin-del-desemp@cagpu.com	$2a$10$xknRGqJLr/z.yPKDj2hBEukcRcuiXoLHwTFdNyMYyyYrVYOSlWX7O	service_user	Evaluación del Desempeño Institucional	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:37.135	2025-08-29 03:13:37.135	\N	f	EVALUACION_DESEMPENO_INSTITUCIONAL
18	estadstica-hospitala	estadstica-hospitala@cagpu.com	$2a$10$dAc1UmuhlFAzsBA3yT5P3uvvcgOfguIROwhSqH57xKmuEmsdpo06u	service_user	Estadística Hospitalaria	Servicio	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	\N	t	2025-08-29 03:13:37.193	2025-08-29 03:13:37.193	\N	f	ESTADISTICA_HOSPITALARIA
19	coordinacin-de-archi	coordinacin-de-archi@cagpu.com	$2a$10$5xJXS5/5moPljSufD.0LNeHc5YQJS2Mc2J6k.rFLMGq0LO/WcTRFS	service_user	Coordinación de Archivos y Gestión Documental	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.25	2025-08-29 03:13:37.25	\N	f	COORDINACION_ARCHIVOS_GESTION_DOCUMENTAL
20	correspondencia	correspondencia@cagpu.com	$2a$10$72KVtZd/NuMydnkJm90hoOTh.kdhFeYZ02mNSbg31LnbgMwmh8wjK	service_user	Correspondencia	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.308	2025-08-29 03:13:37.308	\N	f	CORRESPONDENCIA
21	centro-de-integracin	centro-de-integracin@cagpu.com	$2a$10$Fdsfc8mJ4/WQMsh1M/KV/eUyLlM6dsfI284ERZYhaiPLoCA6FYEB6	service_user	Centro de Integración Informática Médica	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.365	2025-08-29 03:13:37.365	\N	f	CENTRO_INTEGRACION_INFORMATICA_MEDICA
22	subdireccin-de-recur	subdireccin-de-recur@cagpu.com	$2a$10$4IrwV0Jt7iyS12akEgp0QOrxsSvBv69oRtPDfeUA975TsyGxAc5uW	service_user	Subdirección de Recursos Humanos	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.423	2025-08-29 03:13:37.423	\N	f	SUBDIRECCION_RECURSOS_HUMANOS
23	operacin-y-control-d	operacin-y-control-d@cagpu.com	$2a$10$t1fMRERIHbUDL2pxvOuHweasdqkWsZTYzsxaPHEnzaeyeIs7CWkAa	service_user	Operación y Control de Servicios Personales	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.48	2025-08-29 03:13:37.48	\N	f	OPERACION_CONTROL_SERVICIOS_PERSONALES
24	relaciones-laborales	relaciones-laborales@cagpu.com	$2a$10$dJ0NtoBgM2F.9c.kpltD6uLUQMD1xATtFrl4LUzcGr/n3BVtiaI5e	service_user	Relaciones Laborales	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.537	2025-08-29 03:13:37.537	\N	f	RELACIONES_LABORALES
25	sistemas-de-nmina	sistemas-de-nmina@cagpu.com	$2a$10$bkKKLrM5ObM32InflUtUDef73MzyubqpHNNuMyzvbtNUXDVQzti3e	service_user	Sistemas de Nómina	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.594	2025-08-29 03:13:37.594	\N	f	SISTEMAS_NOMINA
28	servicios-generales	servicios-generales@cagpu.com	$2a$10$sN0w74w1U5x/n60G5wyiMOubSaSY7VRPyaVpQum6oSu3Laj/dJeIK	service_user	Servicios Generales	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.766	2025-08-29 03:13:37.766	\N	f	SERVICIOS_GENERALES
29	almacenes-e-inventar	almacenes-e-inventar@cagpu.com	$2a$10$piiBqA65/3mbR1ZSXy4Yl.7WSnZPMKixaCTUQv95v5PWpYVSUW/qe	service_user	Almacenes e Inventarios	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.823	2025-08-29 03:13:37.823	\N	f	ALMACENES_INVENTARIOS
5	pregrado	pregrado@cagpu.com	$2a$10$UV4fwq21dCjBwo6Y9gOfsOGLGQSD5Ui7qAr6ERVGGlPWc6WFoKMc.	service_user	Pregrado	Servicio	DIRECCION_INVESTIGACION_ENSENANZA	\N	t	2025-08-29 03:13:36.449	2025-08-29 04:23:23.722	2025-08-29 04:23:23.722	f	PREGRADO
30	subdireccin-de-recur-2	subdireccin-de-recur-2@cagpu.com	$2a$10$GXa94bixL.7NWA.Br1B0ne5HChujjKwMp.g8uTbkzC2.F/hRRZi6i	service_user	Subdirección de Recursos Financieros	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.881	2025-08-29 03:13:37.881	\N	f	SUBDIRECCION_RECURSOS_FINANCIEROS
31	contabilidad	contabilidad@cagpu.com	$2a$10$fpBlB5QUuw14LVPSLBLMPeLg8oY3NYXLUx2AHLVtMo.v2waF9dN1q	service_user	Contabilidad	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.94	2025-08-29 03:13:37.94	\N	f	CONTABILIDAD
32	alergia-e-inmunologa	alergia-e-inmunologa@cagpu.com	$2a$10$0sXO7KDjuDoNH6QrmciyuuH3SSxRpjDYAP7BO03oZfKKTMlwLdwBu	service_user	Alergia e Inmunología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:37.998	2025-08-29 03:13:37.998	\N	f	ALERGIA_INMUNOLOGIA
33	dermatologa	dermatologa@cagpu.com	$2a$10$j/aVf3YNS7R60oYxiaI.VuvoepkrDvh4alo.iG2nMTo6e3U0OTbBS	service_user	Dermatología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:38.056	2025-08-29 03:13:38.056	\N	f	DERMATOLOGIA
34	unidad-jurdica	unidad-jurdica@cagpu.com	$2a$10$NSaeZVFaNbs3EkZyNNSF/OXtqZabgeAoJtCwFxuv0qd1ES4ls16d6	service_user	Unidad Jurídica	Servicio	DIRECCION_GENERAL	\N	t	2025-08-29 03:13:38.113	2025-08-29 03:13:38.113	\N	f	UNIDAD_JURIDICA
35	integracin-presupues	integracin-presupues@cagpu.com	$2a$10$c9drpxKtKrvGbEeWNXhpZOHt5DSthaSesOXJR2HUGDrPY73n576TK	service_user	Integración Presupuestal	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.171	2025-08-29 03:13:38.171	\N	f	INTEGRACION_PRESUPUESTAL
36	tesorera	tesorera@cagpu.com	$2a$10$L9gIB8oGv4zGzVE/RvraK.sClnNREWH6.b4VJKksyKh/9nzwHLa4G	service_user	Tesorería	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.228	2025-08-29 03:13:38.228	\N	f	TESORERIA
37	proyectos-de-inversi	proyectos-de-inversi@cagpu.com	$2a$10$8nB9Ue6bn8PCQvBvWw1Pruq.ecCiZYMAh2eQ05eQzOVXrD3iA8XEK	service_user	Proyectos de Inversión y Costos	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.286	2025-08-29 03:13:38.286	\N	f	PROYECTOS_INVERSION_COSTOS
38	subdireccin-de-conse	subdireccin-de-conse@cagpu.com	$2a$10$itnRq1KdX0dxbhMIWoTJ.OflZPhGD1Hk94qGrNUY9cXXzGl3BWbrm	service_user	Subdirección de Conservación y Mantenimiento	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.343	2025-08-29 03:13:38.343	\N	f	SUBDIRECCION_CONSERVACION_MANTENIMIENTO
39	ingeniera-biomdica	ingeniera-biomdica@cagpu.com	$2a$10$qysTONWJARH7V3WVu0gdLOeDpzi5kyu/hAQBDffP1KTSsL9VcHV2.	service_user	Ingeniería Biomédica	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.4	2025-08-29 03:13:38.4	\N	f	INGENIERIA_BIOMEDICA
40	mantenimiento	mantenimiento@cagpu.com	$2a$10$4i8qTNTKPtG25ObLiZu/Dux7sgpqwIjguUvKGhTZwayrI/aEZ1OJi	service_user	Mantenimiento	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.457	2025-08-29 03:13:38.457	\N	f	MANTENIMIENTO
41	proteccin-civil	proteccin-civil@cagpu.com	$2a$10$hurJlBQrhR8hdw4xt/0RS.2ENpISsPF3ieXpeA9FO7QUR0Fh3454K	service_user	Protección Civil	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.514	2025-08-29 03:13:38.514	\N	f	PROTECCION_CIVIL
42	obras	obras@cagpu.com	$2a$10$Y8iTjSv9QQimgTZ7dVXNVOfav5jE2/V/gRNSyOiUVTcuuvzWMfPbu	service_user	Obras	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:38.572	2025-08-29 03:13:38.572	\N	f	OBRAS
43	direccin-de-enfermer	direccin-de-enfermer@cagpu.com	$2a$10$tg71jDysQjkOOPgjzu453OB6xwXBvhSP9uztvmOf7Y4s8kZEBvzoy	service_user	Dirección de Enfermería	Servicio	DIRECCION_ENFERMERIA	\N	t	2025-08-29 03:13:38.629	2025-08-29 03:13:38.629	\N	f	DIRECCION_ENFERMERIA_PRINCIPAL
44	servicios-de-enferme	servicios-de-enferme@cagpu.com	$2a$10$V25M3RgEzRTU4HKSegz4YeFhChcgbvTmhb55ww5CQcHubuogcETIS	service_user	Servicios de Enfermería	Servicio	DIRECCION_ENFERMERIA	\N	t	2025-08-29 03:13:38.686	2025-08-29 03:13:38.686	\N	f	SERVICIOS_ENFERMERIA
45	escuela-de-enfermera	escuela-de-enfermera@cagpu.com	$2a$10$d/Lg.kBsqsjRXYCyyZf8V.FqTlbk8yEhpKxOkyxPQD2cmpK1GGxJ6	service_user	Escuela de Enfermería	Servicio	DIRECCION_ENFERMERIA	\N	t	2025-08-29 03:13:38.742	2025-08-29 03:13:38.742	\N	f	ESCUELA_ENFERMERIA
46	divisin-de-medicina	divisin-de-medicina@cagpu.com	$2a$10$GE4xbyGLwFrxxmEsUE7D4OPXHwilJVNqi7gWycPIMdh1pSAJNXioC	service_user	División de Medicina	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:38.799	2025-08-29 03:13:38.799	\N	f	DIVISION_MEDICINA
47	endocrinologa-y-bari	endocrinologa-y-bari@cagpu.com	$2a$10$hSrr9swQp.txL2E6qsUrwemYMJHwKbbJYVMMx4ESZkCqrEFkZAERK	service_user	Endocrinología y Bariatria	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:38.857	2025-08-29 03:13:38.857	\N	f	ENDOCRINOLOGIA_BARIATRIA
48	hematologa	hematologa@cagpu.com	$2a$10$NqNq/o.RyQmIP8lTQfeBL.OKx49/zFZ5IT8r3oJBCMO6UN5/7rT42	service_user	Hematología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:38.914	2025-08-29 03:13:38.914	\N	f	HEMATOLOGIA
49	medicina-interna	medicina-interna@cagpu.com	$2a$10$P3pXVzqe/tDws8d.vIr1BeqgoRHwS0gAWJ6VV1ahTDq5x74mnvLYq	service_user	Medicina Interna	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:38.973	2025-08-29 03:13:38.973	\N	f	MEDICINA_INTERNA
50	neumologa-e-inhalote	neumologa-e-inhalote@cagpu.com	$2a$10$2nWI8wq7xEF0l9Ak0bX2E.lgKu4J8pwov6pngfyPYp7Zm4/UxnV72	service_user	Neumología e Inhaloterapia	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.031	2025-08-29 03:13:39.031	\N	f	NEUMOLOGIA_INHALOTERAPIA
51	geriatra	geriatra@cagpu.com	$2a$10$xpDhbXonxJcUiwtldSXKM.F6UWnNy0ux5yHKoOtDZaf.G7WJrggFK	service_user	Geriatría	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.089	2025-08-29 03:13:39.089	\N	f	GERIATRIA
52	gastroenterologa	gastroenterologa@cagpu.com	$2a$10$cWCMOO5u6CUMwVGTEwEK0eETxi2h7CjsWWQAG1EmCWavXhsaQanv.	service_user	Gastroenterología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.147	2025-08-29 03:13:39.147	\N	f	GASTROENTEROLOGIA
53	nefrologa	nefrologa@cagpu.com	$2a$10$kcOHCLeSY82IShAGCDXD4OtZTpmIwBanwTDcb7GyExdbE8F/2cSPC	service_user	Nefrología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.209	2025-08-29 03:13:39.209	\N	f	NEFROLOGIA
54	neurologa	neurologa@cagpu.com	$2a$10$k0.9XAwuOHzVvkEuRYHJF.myaQ.i/eA9HgTFnrkCLnOuGQdK/ETze	service_user	Neurología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.266	2025-08-29 03:13:39.266	\N	f	NEUROLOGIA
55	psiquiatra-y-salud-m	psiquiatra-y-salud-m@cagpu.com	$2a$10$TT9jSKPjIN/3LzcdEYfQqebAcslNoeipQcHKnE94oDi/LlS1quJ/K	service_user	Psiquiatría y Salud Mental	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.323	2025-08-29 03:13:39.323	\N	f	PSIQUIATRIA_SALUD_MENTAL
56	reumatologa	reumatologa@cagpu.com	$2a$10$aSMyn/BfXI.Kcbr473rXtOT9rzAqkGPZhrdD//NPYYW9SfY7jWMfO	service_user	Reumatología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.38	2025-08-29 03:13:39.38	\N	f	REUMATOLOGIA
57	neurofisiologa	neurofisiologa@cagpu.com	$2a$10$5fDi7Fcjdxh0skmFKMHOC.30kr0yt7Y9x6UKVgNxMSy6kX4UmGNx.	service_user	Neurofisiología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.437	2025-08-29 03:13:39.437	\N	f	NEUROFISIOLOGIA
58	cardiologa	cardiologa@cagpu.com	$2a$10$Ua3njheWiV8jT4BAU08mZu5aOVJ4kYfSKw1z3gN3Q2l.iV6J490yK	service_user	Cardiología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.494	2025-08-29 03:13:39.494	\N	f	CARDIOLOGIA
59	hemodinamia	hemodinamia@cagpu.com	$2a$10$Vi3V..BNjw7E3WA/pqsituEG0gBp7cyxkDkTNr6cDFVocgYFAbUqy	service_user	Hemodinamia	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.552	2025-08-29 03:13:39.552	\N	f	HEMODINAMIA
60	unidad-de-cuidados-c	unidad-de-cuidados-c@cagpu.com	$2a$10$FOONiCv6u8.x2vu3OQtveurVhz9NN6gwwFfKlx94wbpJlXBZBUJt6	service_user	Unidad de Cuidados Coronarios	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.608	2025-08-29 03:13:39.608	\N	f	UNIDAD_CUIDADOS_CORONARIOS
61	toxicologa-clnica	toxicologa-clnica@cagpu.com	$2a$10$ghivC4mZCx1NzJM62x8ll.9aq4MZ3g4fiy9r6KnlOkhWiZwfKQQHS	service_user	Toxicología Clínica	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.666	2025-08-29 03:13:39.666	\N	f	TOXICOLOGIA_CLINICA
62	nutricin-hospitalari	nutricin-hospitalari@cagpu.com	$2a$10$OqJGeSZbWM.snQarBlDaIOA/B07LacOhJzvPhFbDkxDs64tT8i2pm	service_user	Nutrición Hospitalaria	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.722	2025-08-29 03:13:39.722	\N	f	NUTRICION_HOSPITALARIA
65	divisin-de-ciruga	divisin-de-ciruga@cagpu.com	$2a$10$UuTXsUNJozEdXbfaKlNvwuQLt5vPE58FS/whd.YzP3PbaTOkrLgrW	service_user	División de Cirugía	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.908	2025-08-29 03:13:39.908	\N	f	DIVISION_CIRUGIA
66	ciruga-general	ciruga-general@cagpu.com	$2a$10$O2NBj13r9KnCxS4pYVIJxOwIfzEZZ63T2ToyR/vo.9xzamlDA76kS	service_user	Cirugía General	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:39.966	2025-08-29 03:13:39.966	\N	f	CIRUGIA_GENERAL
67	oftalmologa	oftalmologa@cagpu.com	$2a$10$3t91dEkjGtHKjGqLr2mP7utPNB6r2vHGHk46I7LUMik.UjdHNB3Im	service_user	Oftalmología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.023	2025-08-29 03:13:40.023	\N	f	OFTALMOLOGIA
68	oncologa	oncologa@cagpu.com	$2a$10$IIRYAxTSn49/3mSyYtv.iOn2NHndN.CtVZS0N8BmhKdYyA9aZth5G	service_user	Oncología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.08	2025-08-29 03:13:40.08	\N	f	ONCOLOGIA
69	ortopedia-y-traumato	ortopedia-y-traumato@cagpu.com	$2a$10$859LeZ7mMGTyC7oRo.yP8utsTJI4G2WkD9ysN5zt2TyRy22wp1UTa	service_user	Ortopedia y Traumatología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.137	2025-08-29 03:13:40.137	\N	f	ORTOPEDIA_TRAUMATOLOGIA
70	otorrinolaringologa	otorrinolaringologa@cagpu.com	$2a$10$JMBj04VX6NQDsZ27U/Gqk.BrxeyPvGr.Ry4n..NTVxGYQsv.TGcnm	service_user	Otorrinolaringología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.195	2025-08-29 03:13:40.195	\N	f	OTORRINOLARINGOLOGIA
71	ciruga-plstica-y-rec	ciruga-plstica-y-rec@cagpu.com	$2a$10$ygU7E3LPGhItY7rowHu12.WSgEv2XJKXGtqWYtt2fA7tKL8ssAsA.	service_user	Cirugía Plástica y Reconstructiva	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.252	2025-08-29 03:13:40.252	\N	f	CIRUGIA_PLASTICA_RECONSTRUCTIVA
72	urologa	urologa@cagpu.com	$2a$10$Bgj8wB0m.49FkeiNyjlNSeEoPHJASTfdi95uXRBK/qBew2XEGw7L.	service_user	Urología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.31	2025-08-29 03:13:40.31	\N	f	UROLOGIA
73	ciruga-maxilofacial	ciruga-maxilofacial@cagpu.com	$2a$10$tDspWdsdvUZ2fsjlF2QEwe6QuqAMI9.0JkTR5u12YmCIX6PvayUem	service_user	Cirugía Maxilofacial	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.366	2025-08-29 03:13:40.366	\N	f	CIRUGIA_MAXILOFACIAL
74	neurociruga	neurociruga@cagpu.com	$2a$10$khJKsJAP9rHH1MOI3uIeYuAgWXqt45W2CQn.TNAEI9cD069LrokYi	service_user	Neurocirugía	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.425	2025-08-29 03:13:40.425	\N	f	NEUROCIRUGIA
75	trasplantes	trasplantes@cagpu.com	$2a$10$rIrHz3EUda.kfsijPRmk2ONJZoqWSIXXRwahz2KjAgTw38MBofD5K	service_user	Trasplantes	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.483	2025-08-29 03:13:40.483	\N	f	TRASPLANTES
76	ciruga-cardiovascula	ciruga-cardiovascula@cagpu.com	$2a$10$3zw97MFmMEklwipzv2IHgu6qBPWZGcspcTumpWXCxBx4MbxeeAP9W	service_user	Cirugía Cardiovascular	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.541	2025-08-29 03:13:40.541	\N	f	CIRUGIA_CARDIOVASCULAR
77	quirfanos	quirfanos@cagpu.com	$2a$10$Edg7f2vnvcCgZSq0oHUs7.Dy7SzQfNFbuJydo2YoQ17QQiI/GckpS	service_user	Quirófanos	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.599	2025-08-29 03:13:40.599	\N	f	QUIROFANOS
78	endoscopa	endoscopa@cagpu.com	$2a$10$qjh1oX6szNFiq1G6PuNdq.rbP1eHRmlmriuujYbVa/QGQHIwNQHbS	service_user	Endoscopía	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.657	2025-08-29 03:13:40.657	\N	f	ENDOSCOPIA
79	anestesiologa	anestesiologa@cagpu.com	$2a$10$e/r4wXPudGxV4pstUkrwq.O1l3OiT1JzN.5UHTQXLoD9fT9E//wbK	service_user	Anestesiología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.714	2025-08-29 03:13:40.714	\N	f	ANESTESIOLOGIA
80	angiologa	angiologa@cagpu.com	$2a$10$aNUaXBuRmU3aZ8OiQqobF..k8E0a551sWBZLeU1FKqOK0tQvHcWLu	service_user	Angiología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.772	2025-08-29 03:13:40.772	\N	f	ANGIOLOGIA
81	divisin-de-gineco-pe	divisin-de-gineco-pe@cagpu.com	$2a$10$7d6Ms7IqFKRrJUZkI4o88.oAi35ZqVRaDlE.ji5Bg4OaK0K.iTJ6y	service_user	División de Gineco - Pediatría	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.831	2025-08-29 03:13:40.831	\N	f	DIVISION_GINECO_PEDIATRIA
82	ginecologa-y-obstetr	ginecologa-y-obstetr@cagpu.com	$2a$10$3x2XzGUhikDa0BF7qeSjZO/5OV4iW6wN8k0jbj/tZkoLLQODGVl72	service_user	Ginecología y Obstetricia	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.888	2025-08-29 03:13:40.888	\N	f	GINECOLOGIA_OBSTETRICIA
83	neonatologa	neonatologa@cagpu.com	$2a$10$qN6oRpsi78BFriFdBsMN9.6/Pj8Zgmf5zCtukWvqn/OXecdreMC3S	service_user	Neonatología	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:40.946	2025-08-29 03:13:40.946	\N	f	NEONATOLOGIA
84	pediatra-mdica	pediatra-mdica@cagpu.com	$2a$10$V0XfYCyh.3x7XWC.tD6Ze.oxwwfTqwj33qZAA9ZI/J9ngwvGwmjA.	service_user	Pediatría Médica	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.003	2025-08-29 03:13:41.003	\N	f	PEDIATRIA_MEDICA
85	terapia-intensiva-pe	terapia-intensiva-pe@cagpu.com	$2a$10$7I2Uz1/Jg2qLMC87D0ACCe9wAklKatCPupsuMg3ZPFX0VfbnO5gke	service_user	Terapia Intensiva Pediátrica	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.061	2025-08-29 03:13:41.061	\N	f	TERAPIA_INTENSIVA_PEDIATRICA
86	ciruga-peditrica	ciruga-peditrica@cagpu.com	$2a$10$Smu55JW9YOOlmuEmvRMo.e272uozXzLcsg5OxQxl/J0uHa75FPSRG	service_user	Cirugía Pediátrica	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.118	2025-08-29 03:13:41.118	\N	f	CIRUGIA_PEDIATRICA
87	urgencias-peditricas	urgencias-peditricas@cagpu.com	$2a$10$ZQvzs06W/AWS3psS/XmEte4iSBamRa0asiskeoVJzTCQwe6dSj7cC	service_user	Urgencias Pediátricas	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.176	2025-08-29 03:13:41.176	\N	f	URGENCIAS_PEDIATRICAS
88	gentica	gentica@cagpu.com	$2a$10$4UE6GU0LK2DSV/b67EP29etETde8FvHEgS6IvHGIr2DNvq.79WTxa	service_user	Genética	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.233	2025-08-29 03:13:41.233	\N	f	GENETICA
89	laboratorio-de-genti	laboratorio-de-genti@cagpu.com	$2a$10$sA6N55vL/Wvon5qv7WxT0u9dccHhbKnEMTn8ILu.d1/v8qIymH9o6	service_user	Laboratorio de Genética y Diagnóstico Molecular	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.291	2025-08-29 03:13:41.291	\N	f	LABORATORIO_GENETICA_DIAGNOSTICO_MOLECULAR
90	onco-hemato-pediatra	onco-hemato-pediatra@cagpu.com	$2a$10$nh2pJghRYgbC8lkKgtnLAeK.uxngLpVY7galUFCdgdWb1QAEIffPi	service_user	Onco Hemato Pediatría	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.35	2025-08-29 03:13:41.35	\N	f	ONCO_HEMATO_PEDIATRIA
91	divisin-de-apoyo-a-l	divisin-de-apoyo-a-l@cagpu.com	$2a$10$iqJXQrn5D6oyO1yVLExwCuCPI4QAwZc5WbsQ1CQZSsM8zRn4sUj9a	service_user	División de Apoyo a la Atención	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.407	2025-08-29 03:13:41.407	\N	f	DIVISION_APOYO_ATENCION
92	laboratorio-clnico	laboratorio-clnico@cagpu.com	$2a$10$5phZro/KotGEfFv6ZZKmTOUaZXoSjAIDhqfCIw4gm4DHPxnRqAnJ6	service_user	Laboratorio Clínico	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.464	2025-08-29 03:13:41.464	\N	f	LABORATORIO_CLINICO
93	banco-de-sangre	banco-de-sangre@cagpu.com	$2a$10$S7ho0KWeDisv48KmG0lQXOU5ft4otCzAzb9tANikOLs67C///kuv2	service_user	Banco de Sangre	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.523	2025-08-29 03:13:41.523	\N	f	BANCO_SANGRE
94	anatoma-patolgica	anatoma-patolgica@cagpu.com	$2a$10$N8TFJ.3Yebo2jn9w8/TwNO9Tw/S4don1Ii7.tC.5tgQPCnVSy6.pu	service_user	Anatomía Patológica	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.58	2025-08-29 03:13:41.58	\N	f	ANATOMIA_PATOLOGICA
95	radiodiagnstico-e-im	radiodiagnstico-e-im@cagpu.com	$2a$10$Q.2w0ow6R7rzrhSRJXFIQuJPg4MRgZhFuuiJakePOAeVaADyEF27.	service_user	Radiodiagnóstico e Imagen	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.638	2025-08-29 03:13:41.638	\N	f	RADIODIAGNOSTICO_IMAGEN
96	medicina-nuclear	medicina-nuclear@cagpu.com	$2a$10$SUPgBkPHvLOtccHFC/kxuOSvc5NMWUmaVaElBJaaaPMa32bW2vPp6	service_user	Medicina Nuclear	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.695	2025-08-29 03:13:41.695	\N	f	MEDICINA_NUCLEAR
97	urgencias-adultos	urgencias-adultos@cagpu.com	$2a$10$B7mWBH.9k8KYnFknk0kWEe/HmDXioFQbD9kqTjtAg.v5POU1y/ZWO	service_user	Urgencias Adultos	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.753	2025-08-29 03:13:41.753	\N	f	URGENCIAS_ADULTOS
98	unidad-de-cuidados-i	unidad-de-cuidados-i@cagpu.com	$2a$10$KStX8YGVkhZR8vwoDgtOFu7q.NDTtlZuOUj5LkMBQxGBiZHCIIYBS	service_user	Unidad de Cuidados Intensivos Adultos	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.81	2025-08-29 03:13:41.81	\N	f	UNIDAD_CUIDADOS_INTENSIVOS_ADULTOS
99	apoyo-nutricio-y-met	apoyo-nutricio-y-met@cagpu.com	$2a$10$PBCuGg0cUKiO8q8NgwlBF./WF4lk3FqmQL1rVzFdB4TQZIoSw/Qle	service_user	Apoyo Nutricio y Metabólico	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.868	2025-08-29 03:13:41.868	\N	f	APOYO_NUTRICIO_METABOLICO
100	homeopata	homeopata@cagpu.com	$2a$10$RNt.pD2/GrkE4BAx4jiejOJaEGQy52fj2gMbyeXi8J4FaJMOD2vby	service_user	Homeopatía	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.925	2025-08-29 03:13:41.925	\N	f	HOMEOPATIA
101	medicina-fsica-y-reh	medicina-fsica-y-reh@cagpu.com	$2a$10$NapVxCCFnTItoR1BTZmpFOtHQs/97MRNCFGOMQMgD0pugec3tkJKK	service_user	Medicina Física y Rehabilitación	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:41.983	2025-08-29 03:13:41.983	\N	f	MEDICINA_FISICA_REHABILITACION
102	consulta-externa	consulta-externa@cagpu.com	$2a$10$gjuMtV07rYZNu4KzFDQdYeV7Ovur14/gzsq11hqNPqSljO2rGnVYe	service_user	Consulta Externa	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:42.041	2025-08-29 03:13:42.041	\N	f	CONSULTA_EXTERNA
105	archivo-clnico	archivo-clnico@cagpu.com	$2a$10$/fP0GcUE3X6l5Hj8P79yAeL2eDEyutsY/c6OC4QlyK0qIMPWTE5d6	service_user	Archivo Clínico	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:42.215	2025-08-29 03:13:42.215	\N	f	ARCHIVO_CLINICO
106	unidaddeintelig	unidaddeintelig@cagpu.com	$2a$14$8MH1m7uO3aTSBvO3Y2DKOOnuraU9PIhzqEn8s.U04SIfB71Ue3TUK	user	Unidad	de Inteligencia Epidemiológica y Sanitaria Hospita	DIRECCION_MEDICA	\N	t	2025-08-29 03:23:21.024	2025-08-29 03:23:21.024	\N	f	UNIDAD_INTELIGENCIA_EPIDEMIOLOGICA
107	coordinacindese	coordinacindese@cagpu.com	$2a$14$ILgX4K7QNPSnjjBw/aQ.Ae7BLsSzLw.ct76tFwxn6kr2JLA7ecnXm	user	Coordinación	de Seguridad Radiológica y Física Médica	DIRECCION_MEDICA	\N	t	2025-08-29 03:23:21.914	2025-08-29 03:23:21.914	\N	f	COORDINACION_SEGURIDAD_RADIOLOGICA
27	abastecimiento	abastecimiento@cagpu.com	$2a$10$0.dnABects/TBMOIGa3IUuNtwD5iYByGudVgKwztAK0YvDdsPpdCK	service_user	Abastecimiento	Servicio	DIRECCION_ADMINISTRACION	\N	t	2025-08-29 03:13:37.708	2025-08-29 03:49:40.833	2025-08-29 03:49:40.832	f	ABASTECIMIENTO
103	admisin-hospitalaria	admisin-hospitalaria@cagpu.com	$2a$10$UdytGETzBQs13ZAWtek2O.30vx61poEDIgUg/VqX2wg1i.rKsZwmO	service_user	Admisión Hospitalaria	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:42.098	2025-08-30 18:01:34.482	2025-08-30 18:01:34.482	f	ADMISION_HOSPITALARIA
1	admin	admin@cagpu.com	$2a$14$C5n29dmwGdVOYZa8d1qQyuFKJvyGVnYX.Oby9VSaF7h6AmCFvbO1q	admin	Administrador	Sistema	TI	\N	t	2025-08-29 02:20:37.379	2025-08-30 23:47:43.366	2025-08-30 23:47:43.366	f	\N
2	jrochinu	jlrupton@icloud.com	$2a$14$Ez/eyeMtMpNGm7ZPLDTJq.x9jtFxcs7T7U4hIwioRGV1JWcpoZKD.	admin	José Luis	Rochin	TI		t	2025-08-29 02:47:33.798	2025-09-01 03:57:14.103	2025-09-01 03:57:14.103	f	\N
104	trabajo-social	trabajo-social@cagpu.com	$2a$10$69n6ybUh1j8.PlH/WyT7i.rRrkowpCPYR8muXQKzhzo72yUXhY/PC	service_user	Trabajo Social	Servicio	DIRECCION_MEDICA	\N	t	2025-08-29 03:13:42.158	2025-09-01 04:00:17.117	2025-09-01 04:00:17.116	f	TRABAJO_SOCIAL
\.


--
-- TOC entry 3462 (class 0 OID 16597)
-- Dependencies: 224
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public.audit_log (id, action, "targetUserId", "performedBy", details, ip, "userAgent", "createdAt") FROM stdin;
25	login	\N	2	Inicio de sesión exitoso para jrochinu	::ffff:172.66.156.100	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-08-30 21:42:31.301
26	login	\N	2	Inicio de sesión exitoso para jrochinu	::ffff:172.66.156.100	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-08-30 22:08:17.127
27	login	\N	1	Inicio de sesión exitoso para admin	::ffff:172.66.156.100	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-08-30 22:09:59.648
28	login	\N	2	Inicio de sesión exitoso para jrochinu	::ffff:172.18.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-08-30 22:48:45.283
29	login	\N	1	Inicio de sesión exitoso para admin	::ffff:192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-08-30 23:46:25.046
30	login	\N	1	Inicio de sesión exitoso para admin	::ffff:192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-08-30 23:47:43.365
31	login	\N	2	Inicio de sesión exitoso para jrochinu	::ffff:192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-01 03:57:14.098
32	login	\N	104	Inicio de sesión exitoso para trabajo-social	::ffff:192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-01 03:58:47.225
33	login	\N	104	Inicio de sesión exitoso para trabajo-social	::ffff:192.168.65.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-01 04:00:17.116
\.


--
-- TOC entry 3455 (class 0 OID 16531)
-- Dependencies: 217
-- Data for Name: directions; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public.directions (id, name, description, services_count, display_order) FROM stdin;
DIRECCION_ADMINISTRACION	Dirección de Administración	Dirección de Administración del sistema	21	5
DIRECCION_ENFERMERIA	Dirección de Enfermería	Dirección de Enfermería del sistema	3	6
DIRECCION_GENERAL	Dirección General	Dirección General del sistema	1	1
DIRECCION_MEDICA	Dirección Médica	Dirección Médica del sistema	62	2
DIRECCION_INVESTIGACION_ENSENANZA	Dirección de Investigación y Enseñanza	Dirección de Investigación y Enseñanza del sistema	7	3
DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Dirección de Desarrollo y Vinculación Institucional	Dirección de Desarrollo y Vinculación Institucional del sistema	9	4
\.


--
-- TOC entry 3456 (class 0 OID 16539)
-- Dependencies: 218
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public.services (id, direction_id, name, responsible_person, phone_extension, service_type, location, description, is_active, created_at, updated_at) FROM stdin;
UNIDAD_COMUNICACION_SOCIAL	DIRECCION_INVESTIGACION_ENSENANZA	Unidad de Comunicación Social	Mtra. Edith Balleza Beltrán	\N	Unidad	Edificio B, Piso 1	Servicio de unidad de comunicación social	t	2025-08-29 01:49:39.721	2025-08-29 01:49:39.721
SUBDIRECCION_ENSENANZA	DIRECCION_INVESTIGACION_ENSENANZA	Subdirección de Enseñanza	DR. ANTONIO GUTIÉRREZ RAMÍREZ	\N	Subdirección	Edificio G, Piso 2	Servicio de subdirección de enseñanza	t	2025-08-29 01:49:39.721	2025-08-29 01:49:39.721
PREGRADO	DIRECCION_INVESTIGACION_ENSENANZA	Pregrado	Dra. Sandy Mariel Munguía Mogo (ENC)	\N	Servicio	Edificio G, Piso 2	Servicio de pregrado	t	2025-08-29 01:49:39.722	2025-08-29 01:49:39.722
POSGRADO	DIRECCION_INVESTIGACION_ENSENANZA	Posgrado	Dra. Madeleine Edith Velez Cruz	\N	Servicio	Edificio G, Piso 2	Servicio de posgrado	t	2025-08-29 01:49:39.723	2025-08-29 01:49:39.723
EXTENSION_CONTINUA	DIRECCION_INVESTIGACION_ENSENANZA	Extensión Continua	Dra. Paola Alheli Sánchez Jacobo (ENC)	\N	Servicio	Edificio G, Piso 2	Servicio de extensión continua	t	2025-08-29 01:49:39.723	2025-08-29 01:49:39.723
DIVISION_INVESTIGACION	DIRECCION_INVESTIGACION_ENSENANZA	División de Investigación	DRA. VERÓNICA FERNÁNDEZ SÁNCHEZ	\N	División	Edificio G, Piso 2	Servicio de división de investigación	t	2025-08-29 01:49:39.723	2025-08-29 01:49:39.723
DESARROLLO_CIENTIFICO_TECNOLOGICO	DIRECCION_INVESTIGACION_ENSENANZA	Desarrollo Científico y Tecnológico	Dra. Dulce Milagros Razo Blanco Hernández (ENC)	\N	Servicio	Edificio G, Piso 2	Servicio de desarrollo científico y tecnológico	t	2025-08-29 01:49:39.724	2025-08-29 01:49:39.724
UNIDAD_TRANSPARENCIA	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Unidad de Transparencia	Lic. Bruno Enrique Canales Nila	\N	Unidad	Edificio B, Piso 1	Servicio de unidad de transparencia	t	2025-08-29 01:49:39.725	2025-08-29 01:49:39.725
DIVISION_CALIDAD_ATENCION	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	División de Calidad de la Atención	DR. OSCAR SOSA HERNÁNDEZ	\N	División	Edificio B, Piso 1	Servicio de división de calidad de la atención	t	2025-08-29 01:49:39.725	2025-08-29 01:49:39.725
FARMACIA_HOSPITALARIA	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Farmacia Hospitalaria	Q.F.B.Francisco Antonio Jiménez Flores (ENC)	\N	Servicio	Edificio C, Piso 1	Servicio de farmacia hospitalaria	t	2025-08-29 01:49:39.725	2025-08-29 01:49:39.725
FARMACOVIGILANCIA	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Farmacovigilancia	M. en C. Christy Hernández Salazar	\N	Servicio	Edificio C, Piso 1	Servicio de farmacovigilancia	t	2025-08-29 01:49:39.726	2025-08-29 01:49:39.726
CENTRO_MEZCLAS_INSTITUCIONAL	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Centro de Mezclas Institucional	Q.F.B. Eli Oswaldo Pérez Tello (ENC)	\N	Servicio	Edificio A, Planta Baja	Servicio de centro de mezclas institucional	t	2025-08-29 01:49:39.726	2025-08-29 01:49:39.726
DIVISION_VINCULACION_SEGUIMIENTO_CLINICO	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	División de Vinculación y Seguimiento Clínico	DR. LUIS GUSTAVO ZÁRATE SÁNCHEZ	\N	División	Edificio B, Piso 1	Servicio de división de vinculación y seguimiento clínico	t	2025-08-29 01:49:39.727	2025-08-29 01:49:39.727
ANALISIS_PROCESOS_MEJORA_CONTINUA	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Análisis de Procesos y Mejora Continua	Lic. Aída Esperanza Velasco Hernández	\N	Servicio	Edificio B, Piso 1	Servicio de análisis de procesos y mejora continua	t	2025-08-29 01:49:39.727	2025-08-29 01:49:39.727
EVALUACION_DESEMPENO_INSTITUCIONAL	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Evaluación del Desempeño Institucional	Lic. Omar Covarrubias González	\N	Servicio	Edificio B, Piso 1	Servicio de evaluación del desempeño institucional	t	2025-08-29 01:49:39.727	2025-08-29 01:49:39.727
ESTADISTICA_HOSPITALARIA	DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL	Estadística Hospitalaria	Lic. Marco Antonio Hernández Briseño (ENC)	\N	Servicio	Edificio A, Planta Baja	Servicio de estadística hospitalaria	t	2025-08-29 01:49:39.728	2025-08-29 01:49:39.728
COORDINACION_ARCHIVOS_GESTION_DOCUMENTAL	DIRECCION_ADMINISTRACION	Coordinación de Archivos y Gestión Documental	L.C. Cynthia Yanelly Arellano Barajas	\N	Departamento	Edificio B, Piso 1	Servicio de coordinación de archivos y gestión documental	t	2025-08-29 01:49:39.729	2025-08-29 01:49:39.729
CORRESPONDENCIA	DIRECCION_ADMINISTRACION	Correspondencia	C. María del Pilar Hernández Mora (ENC)	\N	Área de coordinación	Edificio A, Planta Baja	Servicio de correspondencia	t	2025-08-29 01:49:39.729	2025-08-29 01:49:39.729
CENTRO_INTEGRACION_INFORMATICA_MEDICA	DIRECCION_ADMINISTRACION	Centro de Integración Informática Médica	Ing. José Hector Paredes Martínez	\N	Servicio	Edificio A-1, Planta Baja	Servicio de centro de integración informática médica	t	2025-08-29 01:49:39.73	2025-08-29 01:49:39.73
SUBDIRECCION_RECURSOS_HUMANOS	DIRECCION_ADMINISTRACION	Subdirección de Recursos Humanos	LIC. ARTURO BOLAÑOS FAVILA	\N	Subdirección	Edificio B, Piso 1	Servicio de subdirección de recursos humanos	t	2025-08-29 01:49:39.73	2025-08-29 01:49:39.73
OPERACION_CONTROL_SERVICIOS_PERSONALES	DIRECCION_ADMINISTRACION	Operación y Control de Servicios Personales	Lic. Oscar Sánchez Ayala	\N	Departamento	Edificio B, Piso 1	Servicio de operación y control de servicios personales	t	2025-08-29 01:49:39.73	2025-08-29 01:49:39.73
RELACIONES_LABORALES	DIRECCION_ADMINISTRACION	Relaciones Laborales	Lic. Elvia Fuentes Flores	\N	Departamento	Edificio B, Piso 1	Servicio de relaciones laborales	t	2025-08-29 01:49:39.731	2025-08-29 01:49:39.731
SISTEMAS_NOMINA	DIRECCION_ADMINISTRACION	Sistemas de Nómina	Lic. Rafael Romero Denis	\N	Departamento	Edificio B, Piso 1	Servicio de sistemas de nómina	t	2025-08-29 01:49:39.731	2025-08-29 01:49:39.731
SUBDIRECCION_RECURSOS_MATERIALES_SERVICIOS	DIRECCION_ADMINISTRACION	Subdirección de Recursos Materiales y Servicios	LIC. ANA LUISA OLIVERA GARCÍA	\N	Subdirección	Edificio B, Piso 1	Servicio de subdirección de recursos materiales y servicios	t	2025-08-29 01:49:39.732	2025-08-29 01:49:39.732
ABASTECIMIENTO	DIRECCION_ADMINISTRACION	Abastecimiento	Lic. Emilio Morales Tirado	\N	Departamento	Edificio B, Piso 1	Servicio de abastecimiento	t	2025-08-29 01:49:39.732	2025-08-29 01:49:39.732
SERVICIOS_GENERALES	DIRECCION_ADMINISTRACION	Servicios Generales	Lic. Jorge Oswaldo Martínez Rodríguez	\N	Departamento	Edificio D, Planta Baja	Servicio de servicios generales	t	2025-08-29 01:49:39.732	2025-08-29 01:49:39.732
ALMACENES_INVENTARIOS	DIRECCION_ADMINISTRACION	Almacenes e Inventarios	Lic. Elia Reyes Sánchez	\N	Departamento	Edificio F, Planta Baja	Servicio de almacenes e inventarios	t	2025-08-29 01:49:39.733	2025-08-29 01:49:39.733
SUBDIRECCION_RECURSOS_FINANCIEROS	DIRECCION_ADMINISTRACION	Subdirección de Recursos Financieros	MTRA. SHEILA GUADALUPE LÓPEZ SORIANO	\N	Subdirección	Edificio B, Piso 1	Servicio de subdirección de recursos financieros	t	2025-08-29 01:49:39.733	2025-08-29 01:49:39.733
CONTABILIDAD	DIRECCION_ADMINISTRACION	Contabilidad	Mtra. Liliana Terán Loyola	\N	Departamento	Edificio B, Piso 1	Servicio de contabilidad	t	2025-08-29 01:49:39.734	2025-08-29 01:49:39.734
ALERGIA_INMUNOLOGIA	DIRECCION_MEDICA	Alergia e Inmunología	Dra. Carol Vivian Moncayo Coello (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de alergia e inmunología	t	2025-08-29 01:49:39.718	2025-08-29 01:51:02.589
DERMATOLOGIA	DIRECCION_MEDICA	Dermatología	Dra. Miriam Puebla Miranda (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de dermatología	t	2025-08-29 01:49:39.719	2025-08-29 01:51:02.59
UNIDAD_JURIDICA	DIRECCION_GENERAL	Unidad Jurídica	Lic. Gabriela Rangel Cruz		Unidad	Edificio B, Piso 1 (Aula A)	Unidad jurídica de la Dirección General	t	2025-08-29 01:49:39.715	2025-08-29 02:45:01.642
INTEGRACION_PRESUPUESTAL	DIRECCION_ADMINISTRACION	Integración Presupuestal	Lic. Leslye Labastida Castro	\N	Departamento	Edificio B, Piso 1	Servicio de integración presupuestal	t	2025-08-29 01:49:39.734	2025-08-29 01:49:39.734
TESORERIA	DIRECCION_ADMINISTRACION	Tesorería	Lic. Gerardo Moreno Hernández	\N	Departamento	Edificio B, Piso 1	Servicio de tesorería	t	2025-08-29 01:49:39.735	2025-08-29 01:49:39.735
PROYECTOS_INVERSION_COSTOS	DIRECCION_ADMINISTRACION	Proyectos de Inversión y Costos	Lic. Dayana Michelle Jiménez Osnaya	\N	Departamento	Edificio B, Piso 1	Servicio de proyectos de inversión y costos	t	2025-08-29 01:49:39.735	2025-08-29 01:49:39.735
SUBDIRECCION_CONSERVACION_MANTENIMIENTO	DIRECCION_ADMINISTRACION	Subdirección de Conservación y Mantenimiento	ING. LUIS OROZCO MARTÍNEZ	\N	Subdirección	Edificio D, Piso 2	Servicio de subdirección de conservación y mantenimiento	t	2025-08-29 01:49:39.736	2025-08-29 01:49:39.736
INGENIERIA_BIOMEDICA	DIRECCION_ADMINISTRACION	Ingeniería Biomédica	Mtra. Miriam Lissette Godínez Torres	\N	Departamento	Edificio D, Piso 2	Servicio de ingeniería biomédica	t	2025-08-29 01:49:39.736	2025-08-29 01:49:39.736
MANTENIMIENTO	DIRECCION_ADMINISTRACION	Mantenimiento	Mtro. Juan César Argumosa Zárate	\N	Departamento	Edificio F, Planta Baja	Servicio de mantenimiento	t	2025-08-29 01:49:39.737	2025-08-29 01:49:39.737
PROTECCION_CIVIL	DIRECCION_ADMINISTRACION	Protección Civil	Lic. Jorge Armando Benítez Corona	\N	Departamento	Edificio D, Planta Baja	Servicio de protección civil	t	2025-08-29 01:49:39.737	2025-08-29 01:49:39.737
OBRAS	DIRECCION_ADMINISTRACION	Obras	Arq. Jaime Rodríguez Martínez	\N	Departamento	Edificio B, Piso 1	Servicio de obras	t	2025-08-29 01:49:39.737	2025-08-29 01:49:39.737
DIRECCION_ENFERMERIA_PRINCIPAL	DIRECCION_ENFERMERIA	Dirección de Enfermería	Mtra. Blanca Estela Cervantes Guzmán	\N	Dirección	Edificio B, Piso 1	Servicio de dirección de enfermería	t	2025-08-29 01:49:39.738	2025-08-29 01:49:39.738
SERVICIOS_ENFERMERIA	DIRECCION_ENFERMERIA	Servicios de Enfermería	Mtra. Leticia Arellano Alvarez (ENC)	\N	Servicio	Edificio B, Piso 1	Servicio de servicios de enfermería	t	2025-08-29 01:49:39.738	2025-08-29 01:49:39.738
ESCUELA_ENFERMERIA	DIRECCION_ENFERMERIA	Escuela de Enfermería	Mtra. Ma. Tolina Alcántara García (ENC)	\N	Servicio	Juárez del Centro	Servicio de escuela de enfermería	t	2025-08-29 01:49:39.739	2025-08-29 01:49:39.739
DIVISION_MEDICINA	DIRECCION_MEDICA	División de Medicina	DR. JESÚS DEL CARMEN MADRIGAL ANAYA (ENC)	\N	División	Edificio B, Piso 1	Servicio de división de medicina	t	2025-08-29 01:49:39.718	2025-08-29 01:51:02.586
ENDOCRINOLOGIA_BARIATRIA	DIRECCION_MEDICA	Endocrinología y Bariatria	Dra. María Guadalupe Guzmán Ortiz (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de endocrinología y bariatria	t	2025-08-29 01:51:02.591	2025-08-29 01:51:02.591
HEMATOLOGIA	DIRECCION_MEDICA	Hematología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de hematología	t	2025-08-29 01:51:02.592	2025-08-29 01:51:02.592
MEDICINA_INTERNA	DIRECCION_MEDICA	Medicina Interna	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de medicina interna	t	2025-08-29 01:51:02.593	2025-08-29 01:51:02.593
NEUMOLOGIA_INHALOTERAPIA	DIRECCION_MEDICA	Neumología e Inhaloterapia	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de neumología e inhaloterapia	t	2025-08-29 01:51:02.594	2025-08-29 01:51:02.594
GERIATRIA	DIRECCION_MEDICA	Geriatría	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de geriatría	t	2025-08-29 01:51:02.595	2025-08-29 01:51:02.595
GASTROENTEROLOGIA	DIRECCION_MEDICA	Gastroenterología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de gastroenterología	t	2025-08-29 01:51:02.595	2025-08-29 01:51:02.595
NEFROLOGIA	DIRECCION_MEDICA	Nefrología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de nefrología	t	2025-08-29 01:51:02.596	2025-08-29 01:51:02.596
NEUROLOGIA	DIRECCION_MEDICA	Neurología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de neurología	t	2025-08-29 01:51:02.597	2025-08-29 01:51:02.597
PSIQUIATRIA_SALUD_MENTAL	DIRECCION_MEDICA	Psiquiatría y Salud Mental	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de psiquiatría y salud mental	t	2025-08-29 01:51:02.597	2025-08-29 01:51:02.597
REUMATOLOGIA	DIRECCION_MEDICA	Reumatología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de reumatología	t	2025-08-29 01:51:02.597	2025-08-29 01:51:02.597
NEUROFISIOLOGIA	DIRECCION_MEDICA	Neurofisiología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de neurofisiología	t	2025-08-29 01:51:02.598	2025-08-29 01:51:02.598
CARDIOLOGIA	DIRECCION_MEDICA	Cardiología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de cardiología	t	2025-08-29 01:51:02.598	2025-08-29 01:51:02.598
HEMODINAMIA	DIRECCION_MEDICA	Hemodinamia	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de hemodinamia	t	2025-08-29 01:51:02.599	2025-08-29 01:51:02.599
UNIDAD_CUIDADOS_CORONARIOS	DIRECCION_MEDICA	Unidad de Cuidados Coronarios	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Unidad	Edificio A, Piso 2	Servicio de unidad de cuidados coronarios	t	2025-08-29 01:51:02.599	2025-08-29 01:51:02.599
TOXICOLOGIA_CLINICA	DIRECCION_MEDICA	Toxicología Clínica	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de toxicología clínica	t	2025-08-29 01:51:02.599	2025-08-29 01:51:02.599
NUTRICION_HOSPITALARIA	DIRECCION_MEDICA	Nutrición Hospitalaria	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de nutrición hospitalaria	t	2025-08-29 01:51:02.6	2025-08-29 01:51:02.6
UNIDAD_INTELIGENCIA_EPIDEMIOLOGICA	DIRECCION_MEDICA	Unidad de Inteligencia Epidemiológica y Sanitaria Hospitalaria	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Unidad	Edificio A, Piso 2	Servicio de unidad de inteligencia epidemiológica y sanitaria hospitalaria	t	2025-08-29 01:51:02.6	2025-08-29 01:51:02.6
COORDINACION_SEGURIDAD_RADIOLOGICA	DIRECCION_MEDICA	Coordinación de Seguridad Radiológica y Física Médica	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Coordinación	Edificio A, Piso 2	Servicio de coordinación de seguridad radiológica y física médica	t	2025-08-29 01:51:02.601	2025-08-29 01:51:02.601
DIVISION_CIRUGIA	DIRECCION_MEDICA	División de Cirugía	DR. JOSÉ LUIS GARCÍA GARCÍA (ENC)	\N	División	Edificio A, Piso 2	Servicio de división de cirugía	t	2025-08-29 01:51:02.601	2025-08-29 01:51:02.601
CIRUGIA_GENERAL	DIRECCION_MEDICA	Cirugía General	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de cirugía general	t	2025-08-29 01:51:02.602	2025-08-29 01:51:02.602
OFTALMOLOGIA	DIRECCION_MEDICA	Oftalmología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de oftalmología	t	2025-08-29 01:51:02.603	2025-08-29 01:51:02.603
ONCOLOGIA	DIRECCION_MEDICA	Oncología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de oncología	t	2025-08-29 01:51:02.603	2025-08-29 01:51:02.603
ORTOPEDIA_TRAUMATOLOGIA	DIRECCION_MEDICA	Ortopedia y Traumatología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de ortopedia y traumatología	t	2025-08-29 01:51:02.604	2025-08-29 01:51:02.604
OTORRINOLARINGOLOGIA	DIRECCION_MEDICA	Otorrinolaringología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de otorrinolaringología	t	2025-08-29 01:51:02.605	2025-08-29 01:51:02.605
CIRUGIA_PLASTICA_RECONSTRUCTIVA	DIRECCION_MEDICA	Cirugía Plástica y Reconstructiva	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de cirugía plástica y reconstructiva	t	2025-08-29 01:51:02.605	2025-08-29 01:51:02.605
UROLOGIA	DIRECCION_MEDICA	Urología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de urología	t	2025-08-29 01:51:02.606	2025-08-29 01:51:02.606
CIRUGIA_MAXILOFACIAL	DIRECCION_MEDICA	Cirugía Maxilofacial	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de cirugía maxilofacial	t	2025-08-29 01:51:02.606	2025-08-29 01:51:02.606
NEUROCIRUGIA	DIRECCION_MEDICA	Neurocirugía	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de neurocirugía	t	2025-08-29 01:51:02.607	2025-08-29 01:51:02.607
TRASPLANTES	DIRECCION_MEDICA	Trasplantes	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de trasplantes	t	2025-08-29 01:51:02.607	2025-08-29 01:51:02.607
CIRUGIA_CARDIOVASCULAR	DIRECCION_MEDICA	Cirugía Cardiovascular	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de cirugía cardiovascular	t	2025-08-29 01:51:02.607	2025-08-29 01:51:02.607
QUIROFANOS	DIRECCION_MEDICA	Quirófanos	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de quirófanos	t	2025-08-29 01:51:02.608	2025-08-29 01:51:02.608
ENDOSCOPIA	DIRECCION_MEDICA	Endoscopía	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de endoscopía	t	2025-08-29 01:51:02.608	2025-08-29 01:51:02.608
ANESTESIOLOGIA	DIRECCION_MEDICA	Anestesiología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de anestesiología	t	2025-08-29 01:51:02.609	2025-08-29 01:51:02.609
ANGIOLOGIA	DIRECCION_MEDICA	Angiología	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de angiología	t	2025-08-29 01:51:02.609	2025-08-29 01:51:02.609
DIVISION_GINECO_PEDIATRIA	DIRECCION_MEDICA	División de Gineco - Pediatría	DRA. MARÍA DEL CARMEN CHÁVEZ SÁNCHEZ (ENC)	\N	División	Edificio A, Piso 2	Servicio de división de gineco - pediatría	t	2025-08-29 01:51:02.609	2025-08-29 01:51:02.609
GINECOLOGIA_OBSTETRICIA	DIRECCION_MEDICA	Ginecología y Obstetricia	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de ginecología y obstetricia	t	2025-08-29 01:51:02.61	2025-08-29 01:51:02.61
NEONATOLOGIA	DIRECCION_MEDICA	Neonatología	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de neonatología	t	2025-08-29 01:51:02.61	2025-08-29 01:51:02.61
PEDIATRIA_MEDICA	DIRECCION_MEDICA	Pediatría Médica	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de pediatría médica	t	2025-08-29 01:51:02.611	2025-08-29 01:51:02.611
TERAPIA_INTENSIVA_PEDIATRICA	DIRECCION_MEDICA	Terapia Intensiva Pediátrica	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de terapia intensiva pediátrica	t	2025-08-29 01:51:02.611	2025-08-29 01:51:02.611
CIRUGIA_PEDIATRICA	DIRECCION_MEDICA	Cirugía Pediátrica	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de cirugía pediátrica	t	2025-08-29 01:51:02.612	2025-08-29 01:51:02.612
URGENCIAS_PEDIATRICAS	DIRECCION_MEDICA	Urgencias Pediátricas	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de urgencias pediátricas	t	2025-08-29 01:51:02.612	2025-08-29 01:51:02.612
GENETICA	DIRECCION_MEDICA	Genética	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de genética	t	2025-08-29 01:51:02.613	2025-08-29 01:51:02.613
LABORATORIO_GENETICA_DIAGNOSTICO_MOLECULAR	DIRECCION_MEDICA	Laboratorio de Genética y Diagnóstico Molecular	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Área de Genética	Edificio A, Piso 2	Servicio de laboratorio de genética y diagnóstico molecular	t	2025-08-29 01:51:02.613	2025-08-29 01:51:02.613
ONCO_HEMATO_PEDIATRIA	DIRECCION_MEDICA	Onco Hemato Pediatría	Dra. María del Carmen Chávez Sánchez (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de onco hemato pediatría	t	2025-08-29 01:51:02.613	2025-08-29 01:51:02.613
DIVISION_APOYO_ATENCION	DIRECCION_MEDICA	División de Apoyo a la Atención	DR. JOSÉ LUIS GARCÍA GARCÍA (ENC)	\N	División	Edificio A, Piso 2	Servicio de división de apoyo a la atención	t	2025-08-29 01:51:02.614	2025-08-29 01:51:02.614
LABORATORIO_CLINICO	DIRECCION_MEDICA	Laboratorio Clínico	Dr. José Luis García García (ENC)	\N	Laboratorio	Edificio A, Piso 2	Servicio de laboratorio clínico	t	2025-08-29 01:51:02.614	2025-08-29 01:51:02.614
BANCO_SANGRE	DIRECCION_MEDICA	Banco de Sangre	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de banco de sangre	t	2025-08-29 01:51:02.614	2025-08-29 01:51:02.614
ANATOMIA_PATOLOGICA	DIRECCION_MEDICA	Anatomía Patológica	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de anatomía patológica	t	2025-08-29 01:51:02.615	2025-08-29 01:51:02.615
RADIODIAGNOSTICO_IMAGEN	DIRECCION_MEDICA	Radiodiagnóstico e Imagen	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de radiodiagnóstico e imagen	t	2025-08-29 01:51:02.615	2025-08-29 01:51:02.615
MEDICINA_NUCLEAR	DIRECCION_MEDICA	Medicina Nuclear	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de medicina nuclear	t	2025-08-29 01:51:02.615	2025-08-29 01:51:02.615
URGENCIAS_ADULTOS	DIRECCION_MEDICA	Urgencias Adultos	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de urgencias adultos	t	2025-08-29 01:51:02.616	2025-08-29 01:51:02.616
UNIDAD_CUIDADOS_INTENSIVOS_ADULTOS	DIRECCION_MEDICA	Unidad de Cuidados Intensivos Adultos	Dr. José Luis García García (ENC)	\N	Unidad	Edificio A, Piso 2	Servicio de unidad de cuidados intensivos adultos	t	2025-08-29 01:51:02.616	2025-08-29 01:51:02.616
APOYO_NUTRICIO_METABOLICO	DIRECCION_MEDICA	Apoyo Nutricio y Metabólico	Dr. José Luis García García (ENC)	\N	Área de cuidados intensivos adultos	Edificio A, Piso 2	Servicio de apoyo nutricio y metabólico	t	2025-08-29 01:51:02.617	2025-08-29 01:51:02.617
HOMEOPATIA	DIRECCION_MEDICA	Homeopatía	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de homeopatía	t	2025-08-29 01:51:02.617	2025-08-29 01:51:02.617
MEDICINA_FISICA_REHABILITACION	DIRECCION_MEDICA	Medicina Física y Rehabilitación	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de medicina física y rehabilitación	t	2025-08-29 01:51:02.618	2025-08-29 01:51:02.618
CONSULTA_EXTERNA	DIRECCION_MEDICA	Consulta Externa	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de consulta externa	t	2025-08-29 01:51:02.618	2025-08-29 01:51:02.618
TRABAJO_SOCIAL	DIRECCION_MEDICA	Trabajo Social	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de trabajo social	t	2025-08-29 01:51:02.619	2025-08-29 01:51:02.619
ARCHIVO_CLINICO	DIRECCION_MEDICA	Archivo Clínico	Dr. José Luis García García (ENC)	\N	Servicio	Edificio A, Piso 2	Servicio de archivo clínico	t	2025-08-29 01:51:02.62	2025-08-29 01:51:02.62
ADMISION_HOSPITALARIA	DIRECCION_MEDICA	Admisión Hospitalaria	Dr. José Luis García García (ENC)		Servicio	Edificio A, Piso 2	Servicio de admisión hospitalaria	t	2025-08-29 01:51:02.619	2025-08-30 18:00:53.043
\.


--
-- TOC entry 3458 (class 0 OID 16549)
-- Dependencies: 220
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public.notifications (id, title, message, user_id, service_id, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 3460 (class 0 OID 16560)
-- Dependencies: 222
-- Data for Name: user_change_history; Type: TABLE DATA; Schema: public; Owner: cagpu_user
--

COPY public.user_change_history (id, "targetUserId", action, "performedBy", details, "createdAt") FROM stdin;
\.


--
-- TOC entry 3468 (class 0 OID 0)
-- Dependencies: 223
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cagpu_user
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 33, true);


--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 219
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cagpu_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 5, true);


--
-- TOC entry 3470 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_change_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cagpu_user
--

SELECT pg_catalog.setval('public.user_change_history_id_seq', 4, true);


--
-- TOC entry 3471 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cagpu_user
--

SELECT pg_catalog.setval('public.users_id_seq', 107, true);


-- Completed on 2025-09-01 06:45:10 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict wfHTPSSfcVZu9trDvZDbFC0f7kacGNgTeSeZDCclvRsZ0arH7GVMjJKVTCrz6Nb


/**
 * Espelha `ApplicationRecord::MAX_STRING_LENGTH`/`MAX_TEXT_LENGTH` na api/
 * (`api/app/models/application_record.rb`) — validação real, sempre ativa
 * em toda coluna `:string`/`:text` de todo model (não é opt-in, roda via
 * `self.class.columns.each` no `validate` de qualquer registro). O front
 * usa o mesmo número tanto no `maxLength` do `<input>` (trava visual,
 * evita colar um texto gigante) quanto no `.max()` do Zod (mensagem de
 * erro clara antes de bater no servidor) — nunca reinventa um limite
 * diferente pra um campo que a API trata como `:string`/`:text` genérico.
 * Ver docs/FORMULARIOS.md.
 */
export const MAX_STRING_LENGTH = 255;
export const MAX_TEXT_LENGTH = 10_000;

/**
 * Senha não é coluna real da tabela (`User#password` é atributo virtual do
 * Devise — ver docs/FORMULARIOS.md) — não passa pelo teto genérico acima.
 * `128` espelha `Devise.password_length` (`config.password_length = 6..128`
 * em `api/config/initializers/devise.rb`), validado de verdade em
 * `User` (`validates :password, length: { within: Devise.password_length }`)
 * — não depende do módulo `:validatable` inteiro do Devise, só da regra de
 * tamanho, pra não trazer validação de e-mail junto sem necessidade.
 */
export const MAX_PASSWORD_LENGTH = 128;
